import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized: Login required" }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // 1. Fetch order from DB
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        design: true,
        user: true,
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. Verify ownership
    if (order.email !== session.user.email) {
      return NextResponse.json({ error: "Forbidden: Access denied" }, { status: 403 });
    }

    // 3. Verify order is still unpaid
    if (order.status === "PAID") {
      return NextResponse.json({ error: "Order is already paid" }, { status: 400 });
    }

    // 4. Create Razorpay order on backend
    const amountPaise = order.amountInr * 100;
    
    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: order.id,
      notes: {
        moryaOrderId: order.id,
        email: order.email,
        designTitle: order.design.title,
      }
    });

    // 5. Save the generated razorpayOrderId against the order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        razorpayOrderId: razorpayOrder.id,
      }
    });

    return NextResponse.json({
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      razorpayOrderId: razorpayOrder.id,
      prefill: {
        name: order.user?.name || session.user.name || "",
        email: order.email,
        phone: order.user?.phone || "",
      },
      productName: "Morya Designs",
      productDescription: `House Plan: ${order.design.title}`,
    });

  } catch (error) {
    console.error("[Create Razorpay Order API Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
