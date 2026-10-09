import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Params = {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, props: Params) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized: Login required" }, { status: 401 });
    }

    const params = await props.params;
    const { id } = params;

    // Load the order
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify ownership
    if (order.email !== session.user.email) {
      return NextResponse.json({ error: "Forbidden: Access denied" }, { status: 403 });
    }

    const paidStatuses = ["PAID", "PROCESSING", "READY", "COMPLETED"];
    if (paidStatuses.includes(order.status)) {
      return NextResponse.json({ message: "Order is already paid" });
    }

    // Update status to PAID
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "PAID",
      },
    });

    return NextResponse.json({ message: "Payment verified successfully", order: updatedOrder });
  } catch (error) {
    console.error("Test payment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
