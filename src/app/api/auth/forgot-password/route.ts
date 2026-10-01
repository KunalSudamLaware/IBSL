import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { resend } from "@/lib/resend";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Always return 200 even if email not found (prevents user enumeration)
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
    }

    // Rate limit: prevent spam — max 1 token per 60 seconds
    const recent = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - 60_000) },
      },
    });
    if (recent) {
      return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
    }

    // Invalidate old tokens
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    // Generate secure token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const resetUrl = `${BASE_URL}/reset-password?token=${rawToken}`;
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey || apiKey === "" || apiKey === "re_mock_key") {
      console.log(`
====================================
[MORYA DESIGNS — DEV PASSWORD RESET]
To    : ${email}
Link  : ${resetUrl}
====================================
      `.trim());
    } else {
      await resend.emails.send({
        from: "Morya Designs <noreply@moryadesigns.com>",
        to: email,
        subject: "Reset your Morya Designs password",
        html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;background:#FAF9F6;padding:40px 24px;">
  <div style="background:#0f172a;padding:28px 32px;border-radius:10px 10px 0 0;text-align:center;">
    <p style="margin:0;color:#b89047;font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;">Morya Designs</p>
    <h1 style="margin:6px 0 0;color:#fff;font-size:20px;font-weight:400;">Password Reset</h1>
  </div>
  <div style="background:#fff;padding:36px 32px;border:1px solid #e7e5e4;border-top:none;">
    <p style="margin:0 0 16px;color:#44403c;font-size:14px;line-height:1.7;">Hello ${user.name},</p>
    <p style="margin:0 0 16px;color:#44403c;font-size:14px;line-height:1.7;">
      We received a request to reset your Morya Designs password. Click the button below to set a new password.
    </p>
    <div style="text-align:center;padding:24px 0;">
      <a href="${resetUrl}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:13px 32px;border-radius:8px;">
        Reset Password
      </a>
    </div>
    <p style="margin:0 0 8px;color:#78716c;font-size:12px;line-height:1.6;">
      This link expires in <strong>30 minutes</strong>.
    </p>
    <p style="margin:0;color:#78716c;font-size:12px;line-height:1.6;">
      If you did not request a password reset, you can safely ignore this email. Your password will not change.
    </p>
  </div>
  <div style="text-align:center;padding:20px;color:#a8a29e;font-size:11px;">
    Morya Designs — <a href="${BASE_URL}" style="color:#b89047;text-decoration:none;">${BASE_URL}</a>
  </div>
</div>
        `,
      });
    }

    return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
  } catch (e) {
    console.error("[forgot-password]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}