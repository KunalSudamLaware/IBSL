import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";

const verifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  otp: z
    .string()
    .regex(/^[0-9]{6}$/, "Verification code must be exactly 6 digits"),
});

const MAX_ATTEMPTS = 5;

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const parsed = verifyOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input." },
        { status: 400 }
      );
    }

    const { email, otp } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    // Find the latest password-reset OTP record for this email
    const otpRecord = await prisma.passwordResetOtp.findFirst({
      where: { email: normalizedEmail },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired verification code. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if code has already been used
    if (otpRecord.usedAt !== null) {
      return NextResponse.json(
        { error: "This verification code has already been used. Please request a new code." },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Check maximum failed attempts
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Maximum verification attempts exceeded. Please request a new code." },
        { status: 429 }
      );
    }

    // Compare submitted OTP with stored hash securely
    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);

    if (!isValid) {
      const updatedAttempts = otpRecord.attempts + 1;
      await prisma.passwordResetOtp.update({
        where: { id: otpRecord.id },
        data: { attempts: updatedAttempts },
      });

      if (updatedAttempts >= MAX_ATTEMPTS) {
        return NextResponse.json(
          { error: "Too many failed attempts. This code is now invalid. Please request a new one." },
          { status: 429 }
        );
      }

      const remaining = MAX_ATTEMPTS - updatedAttempts;
      return NextResponse.json(
        {
          error: `Invalid verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
        },
        { status: 400 }
      );
    }

    // Lookup user to attach reset token
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    // Mark the OTP record as used
    await prisma.passwordResetOtp.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() },
    });

    // Create a cryptographically secure, short-lived reset authorization token for Step 3
    const rawResetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawResetToken).digest("hex");
    const resetExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Invalidate existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Store token hash in PasswordResetToken
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: resetExpiresAt,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Code verified successfully.",
        resetToken: rawResetToken,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[forgot-password/verify] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
