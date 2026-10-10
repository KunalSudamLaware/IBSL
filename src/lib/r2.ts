import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
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

function enforceProductionR2() {
  if (!hasR2 && process.env.NODE_ENV === "production") {
    throw new Error("Missing Cloudflare R2 configuration. Local upload fallback is not supported in production.");
  }
}

export async function uploadToR2(
  bucket: string,
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string
) {
  enforceProductionR2();

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
    // If running locally, return local path unless we strictly enforce production
    // Wait, existing files might be local even if we are in production if it's migrating?
    // Let's just return the relative path for local development
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
  // Safely format the filename to avoid spaces and special chars issues in S3 keys
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `deliverables/${Date.now()}-${safeName}`;
  
  await uploadToR2(bucket, key, fileBuffer, contentType);
  return { key, bucket };
}

export async function objectExistsInR2(bucket: string, key: string) {
  if (!hasR2) return false;
  try {
    await r2Client!.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (err) {
    return false;
  }
}