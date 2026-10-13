import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const design = await prisma.design.findUnique({
    where: { slug: 'luxury-villa-retreat' },
    include: { files: true }
  });
  return NextResponse.json(design);
}
