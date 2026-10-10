import { prisma } from "@/lib/prisma";
import { Prisma, Facing, DesignStatus } from "@prisma/client";
import { parseArrayParam, parsePositiveInt } from "./constants";

export * from "./constants";

export interface FilterParams {
  plotWidth?: number | string | string[];
  plotLength?: number | string | string[];
  minPlotArea?: number | string | string[];
  maxPlotArea?: number | string | string[];
  minPrice?: number | string | string[];
  maxPrice?: number | string | string[];
  bhk?: number | number[] | string | string[];
  floors?: number | number[] | string | string[];
  facing?: Facing | Facing[] | string | string[];
  category?: string | string[];
  styleTags?: string | string[];
  page?: number | string | string[];
  limit?: number | string;
  search?: string;
  sort?: string;
}

export async function getFilteredDesigns(params: FilterParams) {
  const {
    plotWidth: rawPlotWidth,
    plotLength: rawPlotLength,
    minPlotArea: rawMinPlotArea,
    maxPlotArea: rawMaxPlotArea,
    minPrice: rawMinPrice,
    maxPrice: rawMaxPrice,
    bhk: rawBhk,
    floors: rawFloors,
    facing: rawFacing,
    category: rawCategory,
    styleTags: rawStyleTags,
    page: rawPage = 1,
    limit: rawLimit = 12,
    search: rawSearch,
    sort = "newest",
  } = params;

  const page = Math.max(1, parsePositiveInt(rawPage) ?? 1);
  const limit = Math.min(100, Math.max(1, parsePositiveInt(rawLimit) ?? 12));
  const search = rawSearch?.trim();

  // Root condition: only published designs
  const andConditions: Prisma.DesignWhereInput[] = [
    { status: DesignStatus.PUBLISHED },
  ];

  // 1. Text Search across title, description, and category
  if (search) {
    andConditions.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  // 2. Multi-Select BHK Filters (OR logic within BHK, AND logic with other categories)
  const bhkTokens = parseArrayParam(rawBhk);
  if (bhkTokens.length > 0) {
    const exactBhks: number[] = [];
    let has5Plus = false;

    for (const token of bhkTokens) {
      const lower = token.toLowerCase();
      if (lower === "5+" || lower === "5plus" || lower === "5") {
        has5Plus = true;
      } else {
        const n = parseInt(lower, 10);
        if (!isNaN(n)) {
          if (n >= 5) {
            has5Plus = true;
          } else if (n >= 1) {
            exactBhks.push(n);
          }
        }
      }
    }

    const bhkOrConditions: Prisma.DesignWhereInput[] = [];
    if (exactBhks.length > 0) {
      bhkOrConditions.push({ bhk: { in: exactBhks } });
    }
    if (has5Plus) {
      bhkOrConditions.push({ bhk: { gte: 5 } });
    }

    if (bhkOrConditions.length === 1) {
      andConditions.push(bhkOrConditions[0]);
    } else if (bhkOrConditions.length > 1) {
      andConditions.push({ OR: bhkOrConditions });
    }
  }

  // 3. Multi-Select Floors (OR logic within floors, AND logic with other categories)
  const floorTokens = parseArrayParam(rawFloors);
  if (floorTokens.length > 0) {
    const exactFloors: number[] = [];
    let has4Plus = false;

    for (const token of floorTokens) {
      const lower = token.toLowerCase();
      if (lower === "4+" || lower === "4plus" || lower === "4") {
        has4Plus = true;
      } else {
        const n = parseInt(lower, 10);
        if (!isNaN(n)) {
          if (n >= 4) {
            has4Plus = true;
          } else if (n >= 1) {
            exactFloors.push(n);
          }
        }
      }
    }

    const floorOrConditions: Prisma.DesignWhereInput[] = [];
    if (exactFloors.length > 0) {
      floorOrConditions.push({ floors: { in: exactFloors } });
    }
    if (has4Plus) {
      floorOrConditions.push({ floors: { gte: 4 } });
    }

    if (floorOrConditions.length === 1) {
      andConditions.push(floorOrConditions[0]);
    } else if (floorOrConditions.length > 1) {
      andConditions.push({ OR: floorOrConditions });
    }
  }

  // 4. Budget Range (minPrice and maxPrice in INR)
  const minPrice = parsePositiveInt(rawMinPrice);
  const maxPrice = parsePositiveInt(rawMaxPrice);
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter: Prisma.IntFilter = {};
    if (minPrice !== undefined) priceFilter.gte = minPrice;
    if (maxPrice !== undefined) priceFilter.lte = maxPrice;
    andConditions.push({ priceInr: priceFilter });
  }

  // 5. Plot Size (minPlotArea and maxPlotArea in sq.ft)
  const minPlotArea = parsePositiveInt(rawMinPlotArea);
  const maxPlotArea = parsePositiveInt(rawMaxPlotArea);
  if (minPlotArea !== undefined || maxPlotArea !== undefined) {
    const areaFilter: Prisma.IntFilter = {};
    if (minPlotArea !== undefined) areaFilter.gte = minPlotArea;
    if (maxPlotArea !== undefined) areaFilter.lte = maxPlotArea;
    andConditions.push({ plotAreaSqft: areaFilter });
  }

  // 6. Plot Dimensions (Exact/Minimum width and length in feet)
  const plotWidth = parsePositiveInt(rawPlotWidth);
  const plotLength = parsePositiveInt(rawPlotLength);
  if (plotWidth) andConditions.push({ plotWidthFt: plotWidth });
  if (plotLength) andConditions.push({ plotLengthFt: plotLength });

  // 7. Architectural Style (styleTags String[] array in Postgres)
  const styleTags = parseArrayParam(rawStyleTags);
  if (styleTags.length > 0) {
    andConditions.push({ styleTags: { hasSome: styleTags } });
  }

  // 8. Category Filter
  const categories = parseArrayParam(rawCategory);
  if (categories.length === 1) {
    andConditions.push({ category: { equals: categories[0], mode: "insensitive" } });
  } else if (categories.length > 1) {
    andConditions.push({
      OR: categories.map((c) => ({ category: { equals: c, mode: "insensitive" } })),
    });
  }

  // 9. Facing Direction (Facing enum: N, S, E, W)
  const facingTokens = parseArrayParam(rawFacing)
    .map((f) => f.toUpperCase())
    .filter((f): f is Facing => Object.values(Facing).includes(f as Facing));

  if (facingTokens.length === 1) {
    andConditions.push({ facing: facingTokens[0] });
  } else if (facingTokens.length > 1) {
    andConditions.push({ facing: { in: facingTokens } });
  }

  // Combine all conditions via AND logic
  const where: Prisma.DesignWhereInput = {
    AND: andConditions,
  };

  const skip = (page - 1) * limit;

  // Sorting
  let orderBy: Prisma.DesignOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price_asc") {
    orderBy = { priceInr: "asc" };
  } else if (sort === "price_desc") {
    orderBy = { priceInr: "desc" };
  } else if (sort === "area_asc") {
    orderBy = { plotAreaSqft: "asc" };
  } else if (sort === "area_desc") {
    orderBy = { plotAreaSqft: "desc" };
  }

  const [designs, totalCount] = await Promise.all([
    prisma.design.findMany({
      where,
      include: {
        images: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
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
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
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
        },
      },
      reviews: {
        where: { status: "APPROVED" },
        select: { rating: true },
      },
    },
  });
}
