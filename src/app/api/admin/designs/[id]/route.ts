import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { processAndUploadPublicImage } from "@/lib/watermark";
import { uploadPrivateDeliverable } from "@/lib/r2";
import { Facing, DesignStatus, FileType } from "@prisma/client";
import { auth } from "@/lib/auth";

const designSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  slug: z.string().min(1, "Slug is required").optional(),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required").optional(),
  styleTags: z.string().transform((val) => val.split(",").map((s) => s.trim()).filter(Boolean)).optional(),
  plotWidthFt: z.coerce.number().int().positive().optional(),
  plotLengthFt: z.coerce.number().int().positive().optional(),
  plotAreaSqft: z.coerce.number().int().positive().optional(),
  builtUpAreaSqft: z.coerce.number().int().positive().optional(),
  floors: z.coerce.number().int().positive().optional(),
  bhk: z.coerce.number().int().positive().optional(),
  facing: z.nativeEnum(Facing).optional(),
  priceInr: z.coerce.number().int().nonnegative().optional(),
  status: z.nativeEnum(DesignStatus).optional(),
});

// Quick-edit schema for price / status modal
const quickEditSchema = z.object({
  priceInr: z.number().int().min(1, "Price must be greater than 0"),
  discountPriceInr: z.number().int().min(0).optional().nullable(),
  status: z.nativeEnum(DesignStatus),
}).refine((data) => {
  if (data.discountPriceInr != null && data.discountPriceInr >= data.priceInr) {
    return false;
  }
  return true;
}, { message: "Discount price must be less than the original price" });

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: Request, props: PageProps) {
  try {
    // Auth guard — admin only
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await props.params;
    const { id } = params;

    const existingDesign = await prisma.design.findUnique({ where: { id } });
    if (!existingDesign) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    const contentType = req.headers.get("content-type") || "";

    // Handle quick JSON edits (price + status modal)
    if (contentType.includes("application/json")) {
      const body = await req.json();

      // Quick-edit: price + status
      if ("priceInr" in body) {
        const parsed = quickEditSchema.safeParse({
          priceInr: Number(body.priceInr),
          discountPriceInr: body.discountPriceInr != null ? Number(body.discountPriceInr) : null,
          status: body.status,
        });

        if (!parsed.success) {
          return NextResponse.json(
            { error: parsed.error.issues[0].message },
            { status: 400 }
          );
        }

        const updatedDesign = await prisma.design.update({
          where: { id },
          data: {
            priceInr: parsed.data.priceInr,
            status: parsed.data.status,
          },
          select: {
            id: true,
            title: true,
            priceInr: true,
            status: true,
            updatedAt: true,
          },
        });

        return NextResponse.json({ success: true, design: updatedDesign });
      }

      // Simple status-only update (archiving etc.)
      const updatedDesign = await prisma.design.update({
        where: { id },
        data: { status: body.status },
      });
      return NextResponse.json({ success: true, design: updatedDesign });
    }


    // Handle full multipart form updates
    const formData = await req.formData();
    
    // Parse primitive fields
    const parsedData = designSchema.safeParse({
      title: formData.get("title") || undefined,
      slug: formData.get("slug") || undefined,
      description: formData.get("description") || undefined,
      category: formData.get("category") || undefined,
      styleTags: formData.get("styleTags") || undefined,
      plotWidthFt: formData.get("plotWidthFt") || undefined,
      plotLengthFt: formData.get("plotLengthFt") || undefined,
      plotAreaSqft: formData.get("plotAreaSqft") || undefined,
      builtUpAreaSqft: formData.get("builtUpAreaSqft") || undefined,
      floors: formData.get("floors") || undefined,
      bhk: formData.get("bhk") || undefined,
      facing: formData.get("facing") || undefined,
      priceInr: formData.get("priceInr") || undefined,
      status: formData.get("status") || undefined,
    });

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsedData.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsedData.data;

    // Check slug uniqueness if changed
    if (data.slug && data.slug !== existingDesign.slug) {
      const existingSlug = await prisma.design.findUnique({ where: { slug: data.slug } });
      if (existingSlug) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
      }
    }

    // Process Images
    const imageFiles = formData.getAll("images") as File[];
    const uploadedImages = [];
    
    if (imageFiles.length > 0) {
      // Determine starting sort order
      const currentImages = await prisma.designImage.count({ where: { designId: id } });
      let isPrimarySet = currentImages > 0;

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        if (file.size === 0) continue;
        
        const buffer = Buffer.from(await file.arrayBuffer());
        const { url } = await processAndUploadPublicImage(buffer, file.name);
        
        uploadedImages.push({
          url,
          isPrimary: !isPrimarySet,
          sortOrder: currentImages + i,
          altText: `${data.title || existingDesign.title} - view`,
        });
        isPrimarySet = true;
      }
    }

    // Process Deliverable Files
    const uploadedFiles = [];
    
    const dwgFile = formData.get("dwgFile") as File | null;
    if (dwgFile && dwgFile.size > 0) {
      const buffer = Buffer.from(await dwgFile.arrayBuffer());
      const { key } = await uploadPrivateDeliverable(buffer, dwgFile.name, dwgFile.type || "application/octet-stream");
      uploadedFiles.push({
        fileType: FileType.DWG,
        storageKey: key,
        sizeBytes: dwgFile.size,
      });
    }

    const pdfFile = formData.get("pdfFile") as File | null;
    if (pdfFile && pdfFile.size > 0) {
      const buffer = Buffer.from(await pdfFile.arrayBuffer());
      const { key } = await uploadPrivateDeliverable(buffer, pdfFile.name, pdfFile.type || "application/pdf");
      uploadedFiles.push({
        fileType: FileType.PDF,
        storageKey: key,
        sizeBytes: pdfFile.size,
      });
    }

    const threeDFile = formData.get("threeDFile") as File | null;
    if (threeDFile && threeDFile.size > 0) {
      const buffer = Buffer.from(await threeDFile.arrayBuffer());
      const { key } = await uploadPrivateDeliverable(buffer, threeDFile.name, threeDFile.type || "application/octet-stream");
      uploadedFiles.push({
        fileType: FileType.THREE_D,
        storageKey: key,
        sizeBytes: threeDFile.size,
      });
    }

    // Database Transaction
    // If we're uploading new deliverable files, we should clean up the old ones of the same type first
    if (uploadedFiles.length > 0) {
      const fileTypesToDelete = uploadedFiles.map(f => f.fileType);
      await prisma.designFile.deleteMany({
        where: {
          designId: id,
          fileType: { in: fileTypesToDelete }
        }
      });
    }

    const updatedDesign = await prisma.design.update({
      where: { id },
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

    return NextResponse.json({ success: true, design: updatedDesign });
  } catch (error) {
    console.error("Design update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
