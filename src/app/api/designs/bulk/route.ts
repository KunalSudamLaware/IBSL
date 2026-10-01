import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: "Invalid design IDs" }, { status: 400 });
    }

    const designs = await prisma.design.findMany({
      where: {
        id: { in: ids },
        status: "PUBLISHED",
      },
      include: {
        images: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
          take: 1,
        },
      },
    });

    return NextResponse.json({ designs });
  } catch (error) {
    console.error("Bulk design fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
