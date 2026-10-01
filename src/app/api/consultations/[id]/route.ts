import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const consultation = await prisma.consultationRequest.findUnique({
      where: { id },
      include: { design: { select: { title: true, slug: true } } }
    });

    if (!consultation) {
      return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
    }

    // Verify ownership
    if (consultation.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ consultation });
  } catch (error) {
    console.error("[GET /api/consultations/[id]]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
