import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get("sort") || "newest"; // newest, highest, lowest
    
    let orderBy: any = { createdAt: "desc" };
    if (sort === "highest") orderBy = { rating: "desc" };
    if (sort === "lowest") orderBy = { rating: "asc" };

    const reviews = await prisma.review.findMany({
      where: { designId: id, status: "APPROVED" },
      include: {
        user: { select: { id: true, name: true } }
      },
      orderBy
    });

    const aggregates = await prisma.review.aggregate({
      where: { designId: id, status: "APPROVED" },
      _avg: { rating: true },
      _count: { id: true }
    });
    
    const distribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { designId: id, status: "APPROVED" },
      _count: { rating: true }
    });
    
    const distMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach(d => { 
      // @ts-ignore - Prisma dynamic aggregation type mismatch
      distMap[d.rating as keyof typeof distMap] = d._count.rating || 0; 
    });

    let userReview = null;
    let isEligible = false;

    const session = await auth();
    if (session?.user?.id) {
      userReview = await prisma.review.findUnique({
        where: { userId_designId: { userId: session.user.id, designId: id } }
      });
      
      // Check eligibility (has purchased this design and fully paid)
      if (!userReview) {
        const order = await prisma.order.findFirst({
          where: {
            userId: session.user.id,
            designId: id,
            status: { in: ["PAID", "PROCESSING", "READY", "COMPLETED"] }
          }
        });
        if (order) isEligible = true;
      }
    }

    // @ts-ignore - Prisma dynamic aggregation type mismatch
    const totalCount = aggregates._count?.id || 0;
    // @ts-ignore
    const avgRating = aggregates._avg?.rating || 0;

    return NextResponse.json({ 
      reviews: reviews.filter(r => r.userId !== session?.user?.id),
      userReview,
      isEligible,
      average: avgRating,
      total: totalCount,
      distribution: distMap
    });
  } catch (error) {
    console.error("[GET /api/designs/[id]/reviews]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional().transform(s => s?.trim() || "")
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: designId } = await params;
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    
    // Verify eligibility
    const order = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        designId,
        status: { in: ["PAID", "PROCESSING", "READY", "COMPLETED"] }
      },
      orderBy: { createdAt: "desc" }
    });

    if (!order) return NextResponse.json({ error: "You must purchase this design to leave a review." }, { status: 403 });

    // Ensure no duplicate review
    const existing = await prisma.review.findUnique({
      where: { userId_designId: { userId: session.user.id, designId } }
    });
    
    if (existing) return NextResponse.json({ error: "You have already reviewed this design." }, { status: 400 });

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        designId,
        orderId: order.id,
        rating: parsed.data.rating,
        comment: parsed.data.comment
      }
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/designs/[id]/reviews]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: designId } = await params;
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const existing = await prisma.review.findUnique({
      where: { userId_designId: { userId: session.user.id, designId } }
    });

    if (!existing) return NextResponse.json({ error: "Review not found." }, { status: 404 });

    const review = await prisma.review.update({
      where: { id: existing.id },
      data: {
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("[PUT /api/designs/[id]/reviews]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: designId } = await params;

    const existing = await prisma.review.findUnique({
      where: { userId_designId: { userId: session.user.id, designId } }
    });

    if (!existing) return NextResponse.json({ error: "Review not found." }, { status: 404 });

    await prisma.review.delete({
      where: { id: existing.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/designs/[id]/reviews]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
