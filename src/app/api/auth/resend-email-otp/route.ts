import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendEmailVerification } from "@/modules/notifications/emails";

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = resendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    const { email } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email is already verified." }, { status: 400 });
    }

    const pendingUser = await prisma.pendingUser.findUnique({ where: { email } });
    if (!pendingUser) {
      return NextResponse.json({ error: "No pending registration found." }, { status: 404 });
    }

    // Rate limiting: 60 seconds
    const timeSinceLastOtp = Date.now() - pendingUser.createdAt.getTime();
    if (timeSinceLastOtp < 60000) {
      return NextResponse.json({ error: "Please wait 60 seconds before requesting a new OTP." }, { status: 429 });
    }

    // Generate new OTP
    const rawEmailOtp = String(Math.floor(100000 + Math.random() * 900000));
    const emailOtpHash = await bcrypt.hash(rawEmailOtp, 10);
    const emailExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Update the pending user with new OTP and reset the createdAt timestamp for rate limiting
    await prisma.pendingUser.update({
      where: { email },
      data: {
        otpHash: emailOtpHash,
        expiresAt: emailExpiry,
        createdAt: new Date(), // Reset time to enforce 60s wait
      }
    });

    // Send email
    try {
      await sendEmailVerification(email, pendingUser.name, rawEmailOtp);
    } catch (e: any) {
      console.error("Failed to send OTP:", e);
      return NextResponse.json({ error: e.message || "Failed to send OTP email. Please ensure the email provider is configured." }, { status: 500 });
    }

    return NextResponse.json({ message: "OTP resent successfully." }, { status: 200 });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}