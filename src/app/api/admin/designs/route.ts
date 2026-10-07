import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { processAndUploadPublicImage } from "@/lib/watermark";
import { uploadPrivateDeliverable } from "@/lib/r2";
import { Facing, DesignStatus, FileType } from "@prisma/client";

const designSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  styleTags: z.string().transform((val) => val.split(",").map((s) => s.trim()).filter(Boolean)),
  plotWidthFt: z.coerce.number().int().positive(),
  plotLengthFt: z.coerce.number().int().positive(),
  plotAreaSqft: z.coerce.number().int().positive(),
  builtUpAreaSqft: z.coerce.number().int().positive(),
  floors: z.coerce.number().int().positive(),
  bhk: z.coerce.number().int().positive(),
  facing: z.nativeEnum(Facing),
  priceInr: z.coerce.number().int().nonnegative(),
  status: z.nativeEnum(DesignStatus).default(DesignStatus.DRAFT),
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Parse primitive fields
    const parsedData = designSchema.safeParse({
      title: formData.get("title"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      category: formData.get("category"),
      styleTags: formData.get("styleTags") || "",
      plotWidthFt: formData.get("plotWidthFt"),
      plotLengthFt: formData.get("plotLengthFt"),
      plotAreaSqft: formData.get("plotAreaSqft"),
      builtUpAreaSqft: formData.get("builtUpAreaSqft"),
      floors: formData.get("floors"),
      bhk: formData.get("bhk"),
      facing: formData.get("facing"),
      priceInr: formData.get("priceInr"),
      status: formData.get("status"),
    });

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsedData.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsedData.data;

    // Check slug uniqueness
    const existing = await prisma.design.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    // Process Images
    const imageFiles = formData.getAll("images") as File[];
    const uploadedImages = [];
    let isPrimarySet = false;

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (file.size === 0) continue;
      
      const buffer = Buffer.from(await file.arrayBuffer());
      const { url } = await processAndUploadPublicImage(buffer, file.name);
      
      uploadedImages.push({
        url,
        isPrimary: !isPrimarySet,
        sortOrder: i,
        altText: `${data.title} - view ${i + 1}`,
      });
      isPrimarySet = true;
    }

    // Process Deliverable Files
    const uploadedFiles = [];
    
    const dwgFile = formData.get("dwgFile") as File | null;
    if (dwgFile && dwgFile.size > 0) {
      if (!dwgFile.name.toLowerCase().endsWith('.dwg')) { return NextResponse.json({ error: 'Invalid file extension for DWG CAD File' }, { status: 400 }); }
      const buffer = Buffer.from(await dwgFile.arrayBuffer());
      const { key } = await uploadPrivateDeliverable(buffer, dwgFile.name, "application/acad");
      uploadedFiles.push({
        fileType: FileType.DWG,
        storageKey: key,
        sizeBytes: dwgFile.size,
      });
    }

    const pdfFile = formData.get("pdfFile") as File | null;
    if (pdfFile && pdfFile.size > 0) {
      if (!pdfFile.name.toLowerCase().endsWith('.pdf')) { return NextResponse.json({ error: 'Invalid file extension for PDF File' }, { status: 400 }); }
      const buffer = Buffer.from(await pdfFile.arrayBuffer());
      const { key } = await uploadPrivateDeliverable(buffer, pdfFile.name, "application/pdf");
      uploadedFiles.push({
        fileType: FileType.PDF,
        storageKey: key,
        sizeBytes: pdfFile.size,
      });
    }

    const threeDFile = formData.get("threeDFile") as File | null;
    if (threeDFile && threeDFile.size > 0) {
      if (!threeDFile.name.toLowerCase().endsWith('.pdf')) { return NextResponse.json({ error: 'Invalid file extension for 3D File (Must be a 3D PDF)' }, { status: 400 }); }
      const buffer = Buffer.from(await threeDFile.arrayBuffer());
      const { key } = await uploadPrivateDeliverable(buffer, threeDFile.name, "application/pdf");
      uploadedFiles.push({
        fileType: FileType.THREE_D,
        storageKey: key,
        sizeBytes: threeDFile.size,
      });
    }

    // Database Transaction
    const newDesign = await prisma.design.create({
      data: {
        ...data,
        images: {
          create: uploadedImages,
        },
        files: {
          create: uploadedFiles,
        },
      },
      include: {
        images: true,
        files: true,
      }
    });

    return NextResponse.json({ success: true, design: newDesign });
  } catch (error) {
    console.error("Design creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
