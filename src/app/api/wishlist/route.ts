import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wishlists = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        design: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(wishlists);
  } catch (error) {
    console.error("[GET /api/wishlist]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { designId } = await req.json();
    if (!designId) {
      return NextResponse.json({ error: "Design ID is required" }, { status: 400 });
    }

    // Check if design exists
    const design = await prisma.design.findUnique({ where: { id: designId } });
    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    // Upsert or create
    const wishlist = await prisma.wishlist.upsert({
      where: {
        userId_designId: {
          userId: session.user.id,
          designId
        }
      },
      update: {},
      create: {
        userId: session.user.id,
        designId
      }
    });

    return NextResponse.json({ success: true, wishlist });
  } catch (error) {
    console.error("[POST /api/wishlist]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const designId = url.searchParams.get("designId");

    if (!designId) {
      return NextResponse.json({ error: "Design ID is required" }, { status: 400 });
    }

    await prisma.wishlist.deleteMany({
      where: {
        userId: session.user.id,
        designId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/wishlist]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
