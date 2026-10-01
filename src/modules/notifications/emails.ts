import { resend } from "@/lib/resend";
import { generateOrderAccessToken } from "@/lib/tokens";
import nodemailer from "nodemailer";

const FROM_EMAIL = "Morya Designs <onboarding@resend.dev>";
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

// "?"?"? Order Delivery Email "?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?

export async function sendOrderDeliveryEmail(
  order: { id: string; email: string; invoiceNumber: string | null; amountInr: number }, 
  design: { title: string }, 
  invoicePdf: Buffer
) {
  const orderToken = generateOrderAccessToken(order.id, 60 * 24 * 7); 
  const orderAccessUrl = `${BASE_URL}/orders/access?token=${orderToken}`;

  await resend.emails.send({
    from: "Morya Design Firm <onboarding@resend.dev>",
    to: order.email,
    subject: `Your Design is Ready: ${design.title} (Order #${order.invoiceNumber})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0f172a;">Thank you for your purchase!</h2>
        <p>Hi there,</p>
        <p>Your payment of <strong>INR ${order.amountInr.toLocaleString()}</strong> was successful. You can now access your securely hosted design deliverables for <strong>${design.title}</strong>:</p>
        
        <div style="padding: 20px 0; text-align: center;">
          <a href="${orderAccessUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Access Your Deliverables
          </a>
        </div>
        
        <p style="font-size: 0.9em; color: #64748b;"><em>Note: This secure access link expires in 7 days for your protection. If you need it refreshed, please contact support or log in to your account.</em></p>
        
        <p>Please find your official tax invoice attached to this email.</p>
        <br />
        <p>Best regards,<br/><strong>The Morya Design Team</strong></p>
      </div>
    `,
    attachments: [
      {
        filename: `Invoice_${order.invoiceNumber}.pdf`,
        content: invoicePdf,
      }
    ]
  });
}

// "?"?"? Email Verification "?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?

export async function sendEmailVerification(
  to: string,
  customerName: string,
  otp: string
) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error("EMAIL_USER or EMAIL_PASS environment variable is missing. Please configure your email service provider.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  try {
    console.log("Sending OTP to:", to);
    await transporter.sendMail({
      from: `"Morya Designs" <${emailUser}>`,
      to,
      subject: "Morya Designs - Your Email Verification OTP",
      text: `Hello ${customerName},

Thank you for registering with Morya Designs.

Your 6-digit Email Verification OTP is: ${otp}

This OTP will expire in 10 minutes.
Do not share this OTP with anyone.

If you did not request this, you can ignore this email.

Best regards,
Morya Designs`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background-color:#FAF9F6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF9F6;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e7e5e4;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background-color:#0f172a;padding:32px 40px;text-align:center;">
              <p style="margin:0;color:#b89047;font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;">Morya Designs</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:400;letter-spacing:0.02em;">Email Verification</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 20px;color:#0f172a;font-size:20px;font-weight:400;">Hello, ${customerName}</h2>
              <p style="margin:0 0 16px;color:#44403c;font-size:14px;line-height:1.7;">
                Thank you for registering with <strong>Morya Designs</strong>.<br/>
                Please verify your email address by using the OTP below.
              </p>
              <div style="text-align:center;padding:28px 0;">
                <div style="display:inline-block;background-color:#f1f5f9;color:#0f172a;border:1px dashed #cbd5e1;font-size:24px;font-weight:700;letter-spacing:0.3em;padding:16px 36px;border-radius:8px;">
                  ${otp}
                </div>
              </div>
              <p style="margin:0 0 8px;color:#78716c;font-size:12px;line-height:1.6;">
                This OTP will expire in <strong>10 minutes</strong>.<br/>
                <strong>Do not share this OTP with anyone.</strong>
              </p>
              <p style="margin:16px 0 0;color:#94a3b8;font-size:11px;line-height:1.6;">
                If you did not request this, you can ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });
  } catch (error: any) {
    console.error("Nodemailer Error:", error);
    throw error;
  }
}


