import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";
import { z } from "zod";

const createOrderSchema = z.object({
  designId: z.string().min(1, "Design ID is required"),
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
    }

    const { designId, email } = parsed.data;

    // Fetch design details
    const design = await prisma.design.findUnique({
      where: { id: designId },
    });

    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    if (design.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Design is not available for purchase" }, { status: 400 });
    }

    // Razorpay requires amount in paise (multiply INR by 100)
    const amountInPaise = design.priceInr * 100;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Missing Razorpay Keys in environment variables");
      return NextResponse.json({ error: "Missing Razorpay API credentials in .env.local" }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${designId.substring(0, 6)}`,
    });

    if (!rzpOrder || !rzpOrder.id) {
      throw new Error("Failed to create Razorpay order");
    }

    // Create a PENDING order in our database linking the Razorpay order ID
    const dbOrder = await prisma.order.create({
      data: {
        designId: design.id,
        email,
        amountInr: design.priceInr,
        status: "PENDING",
        razorpayOrderId: rzpOrder.id,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      dbOrderId: dbOrder.id,
    });
  } catch (err: unknown) {
    console.error("Order creation error:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
