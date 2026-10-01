import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await req.json();

    const validStatuses = [
      "PENDING", "PAID", "PROCESSING", "READY", "COMPLETED", "FAILED", "REFUNDED", "CANCELLED"
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus }
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("[PUT /api/admin/orders/[id]/status]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
