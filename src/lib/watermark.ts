import sharp from "sharp";

export interface WatermarkOptions {
  text: string;
  fontSize?: number;
  opacity?: number;
  color?: string;
}

/**
 * Applies a text watermark to an image buffer.
 * Returns the watermarked image as a Buffer.
 */
export async function applyWatermark(
  imageBuffer: Buffer,
  options: WatermarkOptions
): Promise<Buffer> {
  const { text, fontSize = 48, opacity = 0.3, color = "white" } = options;

  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  const width = metadata.width ?? 800;
  const height = metadata.height ?? 600;

  const svgOverlay = `
    <svg width="${width}" height="${height}">
      <style>
        .watermark {
          fill: ${color};
          font-size: ${fontSize}px;
          font-family: Arial, sans-serif;
          opacity: ${opacity};
        }
      </style>
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        dominant-baseline="middle"
        class="watermark"
        transform="rotate(-30, ${width / 2}, ${height / 2})"
      >${text}</text>
    </svg>
  `;

  return image
    .composite([
      {
        input: Buffer.from(svgOverlay),
        gravity: "center",
      },
    ])
    .toBuffer();
}

import { uploadToR2 } from "./r2";

export async function processAndUploadPublicImage(
  fileBuffer: Buffer,
  fileName: string
): Promise<{ url: string; key: string }> {
  const watermarkedBuffer = await applyWatermark(fileBuffer, {
    text: "MORYA DESIGN FIRM - PREVIEW ONLY",
    opacity: 0.3,
  });

  const webpBuffer = await sharp(watermarkedBuffer)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const bucket = process.env.CLOUDFLARE_R2_PUBLIC_BUCKET!;
  // Ensure the file extension is .webp
  const sanitizedName = fileName.replace(/\.[^/.]+$/, "");
  const key = `public-images/${Date.now()}-${sanitizedName}.webp`;

  await uploadToR2(bucket, key, webpBuffer, "image/webp");

  if (!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID) {
    const url = `/uploads/${key}`;
    return { url, key };
  }

  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID!;
  // Note: if a custom domain is configured, you'd use that instead
  const url = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;

  return { url, key };
}
