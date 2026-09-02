import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendOtp } from "@/lib/sms";
import { z } from "zod";

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

    const user = await prisma.user.findUnique({
      where: { email },
      include: { mobileVerificationOtps: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.mobileVerified) {
      return NextResponse.json({ message: "Mobile is already verified." }, { status: 200 });
    }
    if (!user.phone) {
      return NextResponse.json({ error: "No mobile number found for this user." }, { status: 400 });
    }

    // Rate limiting (60 seconds)
    const tokens = user.mobileVerificationOtps;
    if (tokens && tokens.length > 0) {
      tokens.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const latestToken = tokens[0];
      const timeSinceLastOtp = Date.now() - latestToken.createdAt.getTime();
      
      if (timeSinceLastOtp < 60000) {
        return NextResponse.json({ error: "Please wait 60 seconds before requesting a new OTP." }, { status: 429 });
      }
    }

    // Delete old tokens
    await prisma.mobileVerificationOtp.deleteMany({
      where: { userId: user.id },
    });

    // Generate new OTP
    const rawOtp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(rawOtp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.mobileVerificationOtp.create({
      data: {
        userId: user.id,
        otpHash,
        expiresAt: otpExpiry,
      },
    });

    await sendOtp(user.phone, rawOtp);

    return NextResponse.json({ message: "A new OTP has been sent to your mobile." }, { status: 200 });
  } catch (error: any) {
    console.error("Resend mobile OTP error:", error);
    if (error.message?.includes("missing")) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}