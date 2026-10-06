import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";

    let whereClause = {};
    if (status !== "ALL") {
      whereClause = { status };
    }

    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
        design: { select: { id: true, title: true, slug: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("[GET /api/admin/reviews]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
