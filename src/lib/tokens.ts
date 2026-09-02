import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
// Secure key generation using NEXTAUTH_SECRET (must be at least 32 bytes for AES-256)
const SECRET_KEY = crypto.createHash("sha256").update(process.env.NEXTAUTH_SECRET || "fallback_default_secret_key").digest();

export interface DownloadTokenData {
  orderId: string;
  fileId: string;
  exp: number;
}

export function generateDownloadToken(orderId: string, fileId: string, expiresInMinutes = 15): string {
  const exp = Date.now() + expiresInMinutes * 60 * 1000;
  const payload = JSON.stringify({ orderId, fileId, exp });
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  
  let encrypted = cipher.update(payload, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  
  // Format: iv:authTag:encryptedData
  const token = `${iv.toString("hex")}:${authTag}:${encrypted}`;
  
  // Base64Url encode to ensure it is URL-safe
  return Buffer.from(token).toString("base64url");
}

export function verifyDownloadToken(token: string): DownloadTokenData | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [ivHex, authTagHex, encryptedHex] = decoded.split(":");
    
    if (!ivHex || !authTagHex || !encryptedHex) return null;
    
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    const data: DownloadTokenData = JSON.parse(decrypted);
    
    if (Date.now() > data.exp) {
      return null; // Token expired
    }
    
    return data;
  } catch {
    return null; // Invalid token format or decryption failure
  }
}

export interface OrderAccessTokenData {
  orderId: string;
  exp: number;
}

export function generateOrderAccessToken(orderId: string, expiresInMinutes = 60 * 24 * 7): string {
  const exp = Date.now() + expiresInMinutes * 60 * 1000;
  const payload = JSON.stringify({ orderId, exp });
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  
  let encrypted = cipher.update(payload, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  
  return Buffer.from(`${iv.toString("hex")}:${authTag}:${encrypted}`).toString("base64url");
}

export function verifyOrderAccessToken(token: string): OrderAccessTokenData | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [ivHex, authTagHex, encryptedHex] = decoded.split(":");
    
    if (!ivHex || !authTagHex || !encryptedHex) return null;
    
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    const data: OrderAccessTokenData = JSON.parse(decrypted);
    
    if (Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}
