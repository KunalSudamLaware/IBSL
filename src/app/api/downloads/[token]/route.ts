import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyDownloadToken } from "@/lib/tokens";
import { getSignedDownloadUrl, objectExistsInR2 } from "@/lib/r2";
import { downloadRateLimiter } from "@/lib/rate-limit";
import fs from "fs";
import path from "path";

type Params = {
  params: Promise<{ token: string }>;
}

export async function GET(req: Request, props: Params) {
  try {
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    
    // Rate Limiting: Max 10 downloads per 5 minutes per IP
    if (!downloadRateLimiter.check(ipAddress, 10, 5 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many download attempts. Please try again later." }, { status: 429 });
    }

    const params = await props.params;
    const { token } = params;
    
    // 1. Decrypt and Verify Token
    const tokenData = verifyDownloadToken(token);
    
    if (!tokenData) {
      return NextResponse.json({ error: "Invalid or expired download link" }, { status: 403 });
    }
    
    const { orderId, fileId } = tokenData;

    // 2. Database Verification
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        design: { 
          include: { files: true } 
        } 
      }
    });
    
    const paidStatuses = ["PAID", "PROCESSING", "READY", "COMPLETED"];
    if (!order || !paidStatuses.includes(order.status)) {
      return NextResponse.json({ error: "Unauthorized: Order is not marked as PAID" }, { status: 403 });
    }

    const file = order.design.files.find((f) => f.id === fileId);
    if (!file) {
      return NextResponse.json({ error: "Requested file not found in this design" }, { status: 404 });
    }
    
    // 3. Log the Download Activity
    await prisma.download.create({
      data: {
        orderId,
        fileId,
        ipAddress,
      }
    });

    const isR2Enabled = !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const bucket = process.env.CLOUDFLARE_R2_PRIVATE_BUCKET || "private";
    const existsInR2 = isR2Enabled ? await objectExistsInR2(bucket, file.storageKey) : false;

    if (!isR2Enabled || !existsInR2) {
      // Check if local file exists on disk
      const localFilePath = path.join(process.cwd(), "public", "uploads", file.storageKey);
      
      if (fs.existsSync(localFilePath)) {
        const fileBuffer = fs.readFileSync(localFilePath);
        const originalName = file.storageKey.split("/").pop() || "design-plan";
        
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="${originalName}"`,
          }
        });
      }

      // If it's a seeded design or missing, stream a generated blueprint txt file
      const content = `MORYA DESIGNS - ARCHITECTURAL BLUEPRINT DELIVERABLE\n\n` +
        `Design Title: ${order.design.title}\n` +
        `File Format: ${file.fileType}\n` +
        `Invoice Number: ${order.invoiceNumber || "N/A"}\n` +
        `Date Purchased: ${order.createdAt.toLocaleDateString("en-IN")}\n` +
        `Authorized Customer: ${order.email}\n\n` +
        `This is a certified digital blueprint plan for ${order.design.bhk} BHK, ` +
        `${order.design.plotWidthFt}x${order.design.plotLengthFt} ft facing ${order.design.facing}.\n\n` +
        `Morya Designs © 2026. All rights reserved.`;

      const ext = file.fileType.toLowerCase() === 'three_d' ? 'zip' : file.fileType.toLowerCase();
      const filename = `${order.design.slug}-${file.fileType.toLowerCase()}.${ext}`;
      
      return new NextResponse(content, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${filename}"`,
        }
      });
    }

    // 4. Generate S3 Presigned URL (Valid for 15 mins)
    const signedUrl = await getSignedDownloadUrl(bucket, file.storageKey, 900);

    // 5. Secure Redirect to the Presigned URL
    return NextResponse.redirect(signedUrl);
    
  } catch (err) {
    console.error("Download endpoint error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
