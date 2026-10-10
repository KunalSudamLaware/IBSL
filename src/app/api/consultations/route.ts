import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateConsultationDate } from "@/lib/date";
import { z } from "zod";

const consultationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  message: z.string().min(1, "Message is required").max(2000).transform(s => s.trim()),
  designId: z.string().optional().nullable(),
  preferredDate: z.string().optional().nullable(),
  preferredTime: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const session = await auth(); // optional for submission, but used if logged in
    const body = await req.json();
    
    const parsed = consultationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, email, mobile, message, designId, preferredDate, preferredTime } = parsed.data;

    // Validate preferredDate: ensure it's not in the past
    if (preferredDate && preferredDate.trim()) {
      const dateValidation = validateConsultationDate(preferredDate);
      if (!dateValidation.valid) {
        return NextResponse.json({ error: dateValidation.error }, { status: 400 });
      }
    }

    const request = await prisma.consultationRequest.create({
      data: {
        userId: session?.user?.id || null,
        designId: designId || null,
        name,
        email,
        mobile,
        message,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        preferredTime: preferredTime || null,
      }
    });

    return NextResponse.json({ success: true, consultation: request }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/consultations]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const consultations = await prisma.consultationRequest.findMany({
      where: { userId: session.user.id },
      include: { design: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ consultations });
  } catch (error) {
    console.error("[GET /api/consultations]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
