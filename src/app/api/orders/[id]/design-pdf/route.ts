import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/r2";
import fs from "fs";
import path from "path";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, props: Params) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please log in to download your design." }, { status: 401 });
    }

    const { id } = await props.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        design: {
          include: {
            files: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.email !== session.user.email && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "You are not authorized to download this design." }, { status: 403 });
    }

    const isFullyPaid = ["PAID", "PROCESSING", "READY", "COMPLETED"].includes(order.status);
    if (!isFullyPaid) {
      return NextResponse.json({ error: "Design download is available after successful payment." }, { status: 403 });
    }

    const pdfFile = order.design.files.find(f => f.fileType === "PDF");

    if (!pdfFile) {
      return NextResponse.json({ error: "The design PDF is not available yet." }, { status: 404 });
    }

    const bucket = process.env.CLOUDFLARE_R2_PRIVATE_BUCKET || "private";
    const signedUrl = await getSignedDownloadUrl(bucket, pdfFile.storageKey, 60);

    // If it's a local fallback (starts with /uploads), we should stream it directly
    if (signedUrl.startsWith("/")) {
      const filePath = path.join(process.cwd(), "public", signedUrl);
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "The design PDF is not available yet." }, { status: 404 });
      }
      
      const fileBuffer = fs.readFileSync(filePath);
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="Morya-Design-${order.design.slug}.pdf"`,
        },
      });
    }

    // Otherwise, proxy the file to avoid CORS issues on the frontend
    try {
      const response = await fetch(signedUrl);
      if (!response.ok) {
        return NextResponse.json({ error: "Unable to download the design PDF. Please try again." }, { status: 500 });
      }

      const contentType = response.headers.get("content-type") || "application/pdf";
      
      // We stream the body back to the client
      return new NextResponse(response.body, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="Morya-Design-${order.design.slug}.pdf"`,
        },
      });
    } catch (fetchError) {
      console.error("[Design PDF Fetch Error]:", fetchError);
      return NextResponse.json({ error: "Unable to download the design PDF. Please try again." }, { status: 500 });
    }

  } catch (error) {
    console.error("[Design PDF Download API] error:", error);
    return NextResponse.json({ error: "Unable to download the design PDF. Please try again." }, { status: 500 });
  }
}
