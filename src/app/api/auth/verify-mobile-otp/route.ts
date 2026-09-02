import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const verifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid OTP format." }, { status: 400 });
    }

    const { email, otp } = parsed.data;

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

    const tokens = user.mobileVerificationOtps;
    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ error: "No OTP found. Please request a new one." }, { status: 400 });
    }

    // Sort by most recent
    tokens.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const latestToken = tokens[0];

    if (latestToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    // Compare OTP
    const isValid = await bcrypt.compare(otp, latestToken.otpHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
    }

    // Mark as verified and delete tokens
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { mobileVerified: true },
      }),
      prisma.mobileVerificationOtp.deleteMany({
        where: { userId: user.id },
      }),
    ]);

    return NextResponse.json({ message: "Mobile verified successfully." }, { status: 200 });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}