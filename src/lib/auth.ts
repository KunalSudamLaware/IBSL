import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const JWT_SECRET = process.env.JWT_SECRET;
export const COOKIE_NAME = "morya_auth";

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

export const getJwtSecretKey = () => {
  if (!JWT_SECRET || JWT_SECRET.length === 0) {
    throw new Error("JWT_SECRET environment variable is not set.");
  }
  return new TextEncoder().encode(JWT_SECRET);
};

export async function createToken(payload: AuthPayload) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(getJwtSecretKey());
}

export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, getJwtSecretKey());
    return verified.payload as unknown as AuthPayload;
  } catch (err) {
    return null;
  }
}

export async function auth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { name: true }
  });

  return {
    user: {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      name: user?.name || "User",
    },
  };
}