import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { isPasswordStrong, PASSWORD_ERROR_MESSAGE } from "@/lib/password";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm Password is required")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
    }

    const { token, password } = parsed.data;

    // Validate strong password
    if (!isPasswordStrong(password)) {
      return NextResponse.json({ error: PASSWORD_ERROR_MESSAGE }, { status: 400 });
    }

    // Hash the token exactly like we did when generating it in verify/route.ts
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Lookup token securely
    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetTokenRecord) {
      return NextResponse.json({ error: "Invalid or expired reset link. Please request a new password reset." }, { status: 400 });
    }

    if (resetTokenRecord.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: resetTokenRecord.id } });
      return NextResponse.json({ error: "This password reset link has expired. Please request a new one." }, { status: 400 });
    }

    // Securely hash the new password using bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user's password securely within a transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: resetTokenRecord.userId },
        data: { passwordHash },
      });

      // Invalidate the reset token
      await tx.passwordResetToken.delete({
        where: { id: resetTokenRecord.id },
      });

      // Invalidate any old OTPs for this user's email just to be fully clean
      await tx.passwordResetOtp.updateMany({
        where: { email: resetTokenRecord.user.email, usedAt: null },
        data: { usedAt: new Date() },
      });
    });

    return NextResponse.json({ success: true, message: "Password reset successfully." }, { status: 200 });

  } catch (error) {
    console.error("[reset-password] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error. Please try again." }, { status: 500 });
  }
}