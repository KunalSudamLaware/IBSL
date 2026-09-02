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

    // Check if the user is already officially registered (happens if they re-verify by mistake)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ success: true, message: "Email is already verified." }, { status: 200 });
    }

    // Fetch the temporary registration data
    const pendingUser = await prisma.pendingUser.findUnique({ where: { email } });

    if (!pendingUser) {
      return NextResponse.json({ error: "No pending registration found for this email. Please register again." }, { status: 404 });
    }

    if (pendingUser.expiresAt < new Date()) {
      return NextResponse.json({ error: "OTP has expired. Please register again to get a new one." }, { status: 400 });
    }

    // Compare OTP
    const isValid = await bcrypt.compare(otp, pendingUser.otpHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
    }

    // OTP is valid! Create the official User and delete the pending record
    await prisma.$transaction([
      prisma.user.create({
        data: {
          name: pendingUser.name,
          email: pendingUser.email,
          phone: pendingUser.phone,
          passwordHash: pendingUser.passwordHash,
          role: "CUSTOMER",
          emailVerified: true,
          mobileVerified: false,
        },
      }),
      prisma.pendingUser.delete({
        where: { email },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Email verified successfully." }, { status: 200 });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}