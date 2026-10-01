import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConsultationStatus } from "@prisma/client";

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
    const body = await req.json();

    const status = body.status as ConsultationStatus;
    const adminNotes = body.adminNotes as string;

    const consultation = await prisma.consultationRequest.update({
      where: { id },
      data: {
        status,
        adminNotes
      }
    });

    return NextResponse.json({ success: true, consultation });
  } catch (error) {
    console.error("[PUT /api/admin/consultations/[id]]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
