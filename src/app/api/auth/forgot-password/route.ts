import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { sendPasswordResetOtpEmail } from "@/modules/notifications/emails";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

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

    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    // Rate limiting: prevent spamming OTPs within 60 seconds
    const recentOtp = await prisma.passwordResetOtp.findFirst({
      where: {
        email: normalizedEmail,
        createdAt: { gte: new Date(Date.now() - 60_000) },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentOtp) {
      return NextResponse.json(
        { error: "Please wait 60 seconds before requesting another code." },
        { status: 429 }
      );
    }

    // Check whether the email belongs to an existing user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      // Invalidate previous unused OTPs for this email
      await prisma.passwordResetOtp.updateMany({
        where: {
          email: normalizedEmail,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });

      // Generate cryptographically secure 6-digit OTP
      const rawOtp = crypto.randomInt(100000, 1000000).toString();
      const otpHash = await bcrypt.hash(rawOtp, 10);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store hashed OTP in database
      await prisma.passwordResetOtp.create({
        data: {
          email: normalizedEmail,
          otpHash,
          expiresAt,
          attempts: 0,
        },
      });

      // Send the OTP via email
      try {
        await sendPasswordResetOtpEmail(normalizedEmail, user.name, rawOtp);
      } catch (mailError) {
        console.error("[forgot-password] Failed to dispatch OTP email:", mailError);
        return NextResponse.json(
          { error: "Failed to send verification email. Please try again later." },
          { status: 500 }
        );
      }
    }

    // Always return a generic success response to protect against user enumeration
    return NextResponse.json(
      {
        success: true,
        message: "If an account exists with this email, a verification code has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[forgot-password] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}