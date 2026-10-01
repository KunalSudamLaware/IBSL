import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            wishlists: true,
          }
        },
        orders: {
          select: { status: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const paidOrders = user.orders.filter(o => o.status === "PAID").length;

    return NextResponse.json({
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        createdAt: user.createdAt,
      },
      stats: {
        totalOrders: user._count.orders,
        paidOrders,
        savedDesigns: user._count.wishlists
      }
    });
  } catch (error) {
    console.error("[GET /api/account/profile]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

const updateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).transform(s => s.trim()),
  phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number."),
});

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = updateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: result.data.name,
        phone: result.data.phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error("[PUT /api/account/profile]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
