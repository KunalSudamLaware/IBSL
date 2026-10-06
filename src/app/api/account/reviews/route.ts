import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reviews = await prisma.review.findMany({
      where: { userId: session.user.id },
      include: {
        design: { select: { id: true, title: true, slug: true, images: { where: { isPrimary: true }, take: 1 } } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("[GET /api/account/reviews]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
