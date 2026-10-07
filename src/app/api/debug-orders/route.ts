import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.order.findMany({ select: { id: true, status: true, design: { select: { id: true, files: true } } } });
  return NextResponse.json(orders);
}
