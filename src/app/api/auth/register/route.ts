import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { sendEmailVerification } from "@/modules/notifications/emails";
import { isPasswordStrong, PASSWORD_ERROR_MESSAGE } from "@/lib/password";

// Indian mobile: starts with 6-9, exactly 10 digits
const INDIAN_MOBILE_RE = /^[6-9][0-9]{9}$/;

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(INDIAN_MOBILE_RE, "Enter a valid 10-digit Indian mobile number (starts with 6-9)"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine(isPasswordStrong, PASSWORD_ERROR_MESSAGE),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, phone, password } = parsed.data;

    // Check email uniqueness
    const emailUser = process.env.EMAIL_USER;
    if (!emailUser || emailUser === "") {
      return NextResponse.json({ error: "EMAIL_USER environment variable is missing or invalid. Please configure your email service provider." }, { status: 500 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const rawEmailOtp = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
    const otpHash = await bcrypt.hash(rawEmailOtp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in temporary PendingUser table instead of User
    await prisma.pendingUser.upsert({
      where: { email },
      update: {
        name,
        phone,
        passwordHash,
        otpHash,
        expiresAt,
        createdAt: new Date(),
      },
      create: {
        name,
        email,
        phone,
        passwordHash,
        otpHash,
        expiresAt,
        createdAt: new Date(),
      },
    });

    // Send communications
    try {
      await sendEmailVerification(email, name, rawEmailOtp);
    } catch (e: any) {
      // Return success: false so the browser alerts the error instead of failing silently
      return NextResponse.json(
        { success: false, error: e.message || "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful. Please verify your email address.",
        /* userId intentionally omitted for pending */
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}