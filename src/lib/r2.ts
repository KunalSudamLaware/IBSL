import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "";

const hasR2 = !!R2_ACCESS_KEY_ID && R2_ACCESS_KEY_ID !== "placeholder";

export const r2Client = hasR2 ? new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
}) : null;

export async function uploadToR2(
  bucket: string,
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string
) {
  if (!hasR2) {
    const uploadPath = path.join(process.cwd(), "public", "uploads", key);
    const dir = path.dirname(uploadPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(uploadPath, body);
    return;
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  return r2Client!.send(command);
}

export async function getSignedDownloadUrl(
  bucket: string,
  key: string,
  expiresIn = 3600
) {
  if (!hasR2) {
    // Return relative local path instead of R2 URL
    return `/uploads/${key}`;
  }

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return getSignedUrl(r2Client!, command, { expiresIn });
}

export async function deleteFromR2(bucket: string, key: string) {
  if (!hasR2) {
    const filePath = path.join(process.cwd(), "public", "uploads", key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return r2Client!.send(command);
}

export async function uploadPrivateDeliverable(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string = "application/octet-stream"
) {
  const bucket = process.env.CLOUDFLARE_R2_PRIVATE_BUCKET || "private";
  const key = `deliverables/${Date.now()}-${fileName}`;
  
  await uploadToR2(bucket, key, fileBuffer, contentType);
  return { key, bucket };
}
