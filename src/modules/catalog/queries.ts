import { prisma } from "@/lib/prisma";
import { Prisma, Facing, DesignStatus } from "@prisma/client";

export interface FilterParams {
  plotWidth?: number;
  plotLength?: number;
  maxPrice?: number;
  bhk?: number;
  floors?: number;
  facing?: Facing;
  category?: string;
  styleTags?: string[];
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}

export async function getFilteredDesigns(params: FilterParams) {
  const {
    plotWidth,
    plotLength,
    maxPrice,
    bhk,
    floors,
    facing,
    category,
    styleTags,
    page = 1,
    limit = 12,
    search,
    sort = "newest",
  } = params;

  const where: Prisma.DesignWhereInput = {
    status: DesignStatus.PUBLISHED,
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
    ];
  }

  // Exact match for dimensions
  if (plotWidth) where.plotWidthFt = plotWidth;
  if (plotLength) where.plotLengthFt = plotLength;
  
  if (maxPrice) where.priceInr = { lte: maxPrice };
  if (bhk) where.bhk = bhk;
  if (floors) where.floors = floors;
  if (facing) where.facing = facing;
  if (category) where.category = category;
  
  if (styleTags && styleTags.length > 0) {
    where.styleTags = { hasSome: styleTags };
  }

  const skip = (page - 1) * limit;

  let orderBy: Prisma.DesignOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { priceInr: "asc" };
  else if (sort === "price_desc") orderBy = { priceInr: "desc" };

  const [designs, totalCount] = await Promise.all([
    prisma.design.findMany({
      where,
      include: {
        images: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
          take: 1,
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.design.count({ where }),
  ]);

  return {
    designs,
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / limit),
  };
}

export async function getDesignBySlug(slug: string) {
  return prisma.design.findUnique({
    where: { slug, status: DesignStatus.PUBLISHED },
    include: {
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      },
      files: {
        select: {
          fileType: true,
          sizeBytes: true,
        }
      },
      reviews: {
        where: { status: "APPROVED" },
        select: { rating: true }
      }
    },
  });
}
