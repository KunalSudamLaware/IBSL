import { prisma } from "@/lib/prisma";
import { OrderStatus, Role, Prisma } from "@prisma/client";
import {
  PeriodFilter,
  AnalyticsReportData,
  AnalyticsSummary,
  MonthlyChartPoint,
  MetricComparison,
  TransactionItem,
} from "./types";

export const PROJECT_TIMEZONE = "Asia/Kolkata";
export const SUCCESS_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.COMPLETED,
  OrderStatus.PROCESSING,
  OrderStatus.READY,
];

function getISTParts(date: Date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: PROJECT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [year, month, day] = formatter.format(date).split("-").map(Number);
  return { year, month, day };
}

function startOfISTDay(year: number, month: number, day: number): Date {
  const yStr = String(year);
  const mStr = String(month).padStart(2, "0");
  const dStr = String(day).padStart(2, "0");
  return new Date(`${yStr}-${mStr}-${dStr}T00:00:00.000+05:30`);
}

function endOfISTDay(year: number, month: number, day: number): Date {
  const yStr = String(year);
  const mStr = String(month).padStart(2, "0");
  const dStr = String(day).padStart(2, "0");
  return new Date(`${yStr}-${mStr}-${dStr}T23:59:59.999+05:30`);
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function subtractMonths(y: number, m: number, k: number) {
  let targetM = m - k;
  let targetY = y;
  while (targetM <= 0) {
    targetM += 12;
    targetY -= 1;
  }
  return { year: targetY, month: targetM };
}

export function resolvePeriodDateRange(
  period: PeriodFilter,
  customFrom?: string,
  customTo?: string
): {
  startDate: Date;
  endDate: Date;
  prevStartDate: Date;
  prevEndDate: Date;
  validatedCustomFrom?: string;
  validatedCustomTo?: string;
} {
  const { year, month } = getISTParts();

  if (period === "this_month") {
    const startDate = startOfISTDay(year, month, 1);
    const endDate = endOfISTDay(year, month, lastDayOfMonth(year, month));

    const prev = subtractMonths(year, month, 1);
    const prevStartDate = startOfISTDay(prev.year, prev.month, 1);
    const prevEndDate = endOfISTDay(prev.year, prev.month, lastDayOfMonth(prev.year, prev.month));

    return { startDate, endDate, prevStartDate, prevEndDate };
  }

  if (period === "last_month") {
    const lm = subtractMonths(year, month, 1);
    const startDate = startOfISTDay(lm.year, lm.month, 1);
    const endDate = endOfISTDay(lm.year, lm.month, lastDayOfMonth(lm.year, lm.month));

    const prev = subtractMonths(year, month, 2);
    const prevStartDate = startOfISTDay(prev.year, prev.month, 1);
    const prevEndDate = endOfISTDay(prev.year, prev.month, lastDayOfMonth(prev.year, prev.month));

    return { startDate, endDate, prevStartDate, prevEndDate };
  }

  if (period === "last_3_months") {
    const startM = subtractMonths(year, month, 2);
    const startDate = startOfISTDay(startM.year, startM.month, 1);
    const endDate = endOfISTDay(year, month, lastDayOfMonth(year, month));

    const prevEndM = subtractMonths(year, month, 3);
    const prevStartM = subtractMonths(year, month, 5);
    const prevStartDate = startOfISTDay(prevStartM.year, prevStartM.month, 1);
    const prevEndDate = endOfISTDay(prevEndM.year, prevEndM.month, lastDayOfMonth(prevEndM.year, prevEndM.month));

    return { startDate, endDate, prevStartDate, prevEndDate };
  }

  if (period === "last_6_months") {
    const startM = subtractMonths(year, month, 5);
    const startDate = startOfISTDay(startM.year, startM.month, 1);
    const endDate = endOfISTDay(year, month, lastDayOfMonth(year, month));

    const prevEndM = subtractMonths(year, month, 6);
    const prevStartM = subtractMonths(year, month, 11);
    const prevStartDate = startOfISTDay(prevStartM.year, prevStartM.month, 1);
    const prevEndDate = endOfISTDay(prevEndM.year, prevEndM.month, lastDayOfMonth(prevEndM.year, prevEndM.month));

    return { startDate, endDate, prevStartDate, prevEndDate };
  }

  if (period === "last_12_months") {
    const startM = subtractMonths(year, month, 11);
    const startDate = startOfISTDay(startM.year, startM.month, 1);
    const endDate = endOfISTDay(year, month, lastDayOfMonth(year, month));

    const prevEndM = subtractMonths(year, month, 12);
    const prevStartM = subtractMonths(year, month, 23);
    const prevStartDate = startOfISTDay(prevStartM.year, prevStartM.month, 1);
    const prevEndDate = endOfISTDay(prevEndM.year, prevEndM.month, lastDayOfMonth(prevEndM.year, prevEndM.month));

    return { startDate, endDate, prevStartDate, prevEndDate };
  }

  // Custom date range
  if (customFrom && customTo && /^\d{4}-\d{2}-\d{2}$/.test(customFrom) && /^\d{4}-\d{2}-\d{2}$/.test(customTo)) {
    const [fy, fm, fd] = customFrom.split("-").map(Number);
    const [ty, tm, td] = customTo.split("-").map(Number);

    let fromDate = startOfISTDay(fy, fm, fd);
    let toDate = endOfISTDay(ty, tm, td);

    // Swap if from > to
    if (fromDate > toDate) {
      fromDate = startOfISTDay(ty, tm, td);
      toDate = endOfISTDay(fy, fm, fd);
    }

    const durationMs = toDate.getTime() - fromDate.getTime();
    const prevEndDate = new Date(fromDate.getTime() - 1);
    const prevStartDate = new Date(prevEndDate.getTime() - durationMs);

    return {
      startDate: fromDate,
      endDate: toDate,
      prevStartDate,
      prevEndDate,
      validatedCustomFrom: customFrom,
      validatedCustomTo: customTo,
    };
  }

  // Fallback to this month
  return resolvePeriodDateRange("this_month");
}

function computeMetricComparison(
  current: number,
  previous: number,
  labelPrefix: string = "vs previous period"
): MetricComparison {
  if (previous === 0) {
    if (current === 0) {
      return {
        current,
        previous,
        percentChange: 0,
        direction: "flat",
        label: "0% " + labelPrefix,
      };
    }
    return {
      current,
      previous,
      percentChange: 100,
      direction: "up",
      label: "+100% " + labelPrefix,
    };
  }

  const change = ((current - previous) / previous) * 100;
  const rounded = Math.round(change * 10) / 10;
  const isUp = rounded > 0;
  const isDown = rounded < 0;

  return {
    current,
    previous,
    percentChange: rounded,
    direction: isUp ? "up" : isDown ? "down" : "flat",
    label: `${isUp ? "+" : ""}${rounded}% ${labelPrefix}`,
  };
}

export interface AnalyticsQueryOptions {
  period?: PeriodFilter;
  from?: string;
  to?: string;
  statusFilter?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getAnalyticsReport(
  options: AnalyticsQueryOptions = {}
): Promise<AnalyticsReportData> {
  const period: PeriodFilter = options.period || "this_month";
  const {
    startDate,
    endDate,
    prevStartDate,
    prevEndDate,
    validatedCustomFrom,
    validatedCustomTo,
  } = resolvePeriodDateRange(period, options.from, options.to);

  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(options.limit) || 10));
  const search = options.search?.trim();
  const statusFilter = options.statusFilter?.trim();

  const endIST = getISTParts(endDate);
  const startIST = getISTParts(startDate);
  const totalMonthsDiff = (endIST.year - startIST.year) * 12 + (endIST.month - startIST.month) + 1;
  const chartMonthsCount = period === "last_12_months" ? 12 : Math.max(6, Math.min(24, totalMonthsDiff));
  const earliestChartM = subtractMonths(endIST.year, endIST.month, chartMonthsCount - 1);
  const chartStartDate = startOfISTDay(earliestChartM.year, earliestChartM.month, 1);

  // 1. Fetch Current & Previous Period Summary Metrics Concurrently
  const [
    currRevenueAgg,
    currPurchasesCount,
    currCustomersRegistered,
    currConsultsCount,
    currPaidOrders,

    prevRevenueAgg,
    prevPurchasesCount,
    prevCustomersRegistered,
    prevConsultsCount,
    prevPaidOrders,

    monthlyOrders,
  ] = await Promise.all([
    // Current Period: Total Revenue
    prisma.order.aggregate({
      _sum: { amountInr: true },
      where: {
        status: { in: SUCCESS_STATUSES },
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
    // Current Period: Design Purchases
    prisma.order.count({
      where: {
        status: { in: SUCCESS_STATUSES },
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
    // Current Period: Total Customers Registered
    prisma.user.count({
      where: {
        role: Role.CUSTOMER,
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
    // Current Period: Consultation Requests
    prisma.consultationRequest.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
    // Current Period: Unique Paid Customers
    prisma.order.findMany({
      where: {
        status: { in: SUCCESS_STATUSES },
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { userId: true, email: true },
    }),

    // Previous Period: Total Revenue
    prisma.order.aggregate({
      _sum: { amountInr: true },
      where: {
        status: { in: SUCCESS_STATUSES },
        createdAt: { gte: prevStartDate, lte: prevEndDate },
      },
    }),
    // Previous Period: Design Purchases
    prisma.order.count({
      where: {
        status: { in: SUCCESS_STATUSES },
        createdAt: { gte: prevStartDate, lte: prevEndDate },
      },
    }),
    // Previous Period: Total Customers Registered
    prisma.user.count({
      where: {
        role: Role.CUSTOMER,
        createdAt: { gte: prevStartDate, lte: prevEndDate },
      },
    }),
    // Previous Period: Consultation Requests
    prisma.consultationRequest.count({
      where: {
        createdAt: { gte: prevStartDate, lte: prevEndDate },
      },
    }),
    // Previous Period: Unique Paid Customers
    prisma.order.findMany({
      where: {
        status: { in: SUCCESS_STATUSES },
        createdAt: { gte: prevStartDate, lte: prevEndDate },
      },
      select: { userId: true, email: true },
    }),

    // Monthly Chart Points: Query all successful orders in the chart display window (anchored to endDate)
    prisma.order.findMany({
      where: {
        status: { in: SUCCESS_STATUSES },
        createdAt: {
          gte: chartStartDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        amountInr: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Compute Current Values
  const currTotalRevenue = currRevenueAgg._sum.amountInr || 0;
  const currDesignPurchases = currPurchasesCount;
  const currPaidCustomers = new Set(
    currPaidOrders.map((o) => (o.userId ? `id:${o.userId}` : `email:${o.email.toLowerCase()}`))
  ).size;
  const currAov = currDesignPurchases > 0 ? Math.round(currTotalRevenue / currDesignPurchases) : 0;

  // Compute Previous Values
  const prevTotalRevenue = prevRevenueAgg._sum.amountInr || 0;
  const prevDesignPurchases = prevPurchasesCount;
  const prevPaidCustomers = new Set(
    prevPaidOrders.map((o) => (o.userId ? `id:${o.userId}` : `email:${o.email.toLowerCase()}`))
  ).size;
  const prevAov = prevDesignPurchases > 0 ? Math.round(prevTotalRevenue / prevDesignPurchases) : 0;

  // Build Summary Object
  const summary: AnalyticsSummary = {
    totalCustomers: computeMetricComparison(currCustomersRegistered, prevCustomersRegistered),
    paidCustomers: computeMetricComparison(currPaidCustomers, prevPaidCustomers),
    designPurchases: computeMetricComparison(currDesignPurchases, prevDesignPurchases),
    totalRevenue: computeMetricComparison(currTotalRevenue, prevTotalRevenue),
    averageOrderValue: computeMetricComparison(currAov, prevAov),
    consultationRequests: computeMetricComparison(currConsultsCount, prevConsultsCount),
  };

  // 2. Build Monthly Chart Points
  const chartMonthMap = new Map<string, { revenue: number; purchases: number }>();

  for (let i = chartMonthsCount - 1; i >= 0; i--) {
    const mInfo = subtractMonths(endIST.year, endIST.month, i);
    const key = `${mInfo.year}-${String(mInfo.month).padStart(2, "0")}`;
    chartMonthMap.set(key, { revenue: 0, purchases: 0 });
  }

  // Populate from queried orders
  for (const o of monthlyOrders) {
    const oParts = getISTParts(o.createdAt);
    const key = `${oParts.year}-${String(oParts.month).padStart(2, "0")}`;
    if (chartMonthMap.has(key)) {
      const existing = chartMonthMap.get(key)!;
      existing.revenue += o.amountInr;
      existing.purchases += 1;
    }
  }

  const chartPoints: MonthlyChartPoint[] = Array.from(chartMonthMap.entries()).map(([key, data]) => {
    const [yStr, mStr] = key.split("-");
    const mNum = parseInt(mStr, 10);
    const dateObj = new Date(parseInt(yStr, 10), mNum - 1, 1);
    const shortLabel = dateObj.toLocaleDateString("en-US", { month: "short" });
    const label = `${shortLabel} ${yStr}`;

    return {
      monthKey: key,
      label,
      shortLabel,
      revenue: data.revenue,
      purchases: data.purchases,
      successfulPayments: data.purchases,
    };
  });

  // 3. Transactions & Purchase Details Table Query
  const tableWhere: Prisma.OrderWhereInput = {
    createdAt: { gte: startDate, lte: endDate },
  };

  // Status Filter
  if (statusFilter && statusFilter !== "ALL") {
    if (statusFilter === "SUCCESS") {
      tableWhere.status = { in: SUCCESS_STATUSES };
    } else if (Object.values(OrderStatus).includes(statusFilter as OrderStatus)) {
      tableWhere.status = statusFilter as OrderStatus;
    }
  }

  // Search Filter
  if (search) {
    tableWhere.OR = [
      { id: { contains: search, mode: "insensitive" } },
      { invoiceNumber: { contains: search, mode: "insensitive" } },
      { razorpayOrderId: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { design: { title: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [tableOrders, totalTableCount] = await Promise.all([
    prisma.order.findMany({
      where: tableWhere,
      select: {
        id: true,
        invoiceNumber: true,
        razorpayOrderId: true,
        amountInr: true,
        status: true,
        createdAt: true,
        email: true,
        user: { select: { name: true, email: true } },
        design: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where: tableWhere }),
  ]);

  const transactions: TransactionItem[] = tableOrders.map((o) => {
    const orderId =
      o.invoiceNumber ||
      (o.razorpayOrderId ? o.razorpayOrderId.replace("temp_rzp_", "RZP-") : o.id.slice(-8).toUpperCase());

    return {
      id: o.id,
      orderId,
      customerName: o.user?.name || o.email.split("@")[0] || "Customer",
      customerEmail: o.email,
      designTitle: o.design?.title || "Design Package",
      amountInr: o.amountInr,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    };
  });

  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: PROJECT_TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return {
    period,
    dateRange: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startDateDisplay: formatter.format(startDate),
      endDateDisplay: formatter.format(endDate),
      customFrom: validatedCustomFrom,
      customTo: validatedCustomTo,
    },
    previousDateRange: {
      startDate: prevStartDate.toISOString(),
      endDate: prevEndDate.toISOString(),
      startDateDisplay: formatter.format(prevStartDate),
      endDateDisplay: formatter.format(prevEndDate),
    },
    summary,
    chartPoints,
    tableData: {
      transactions,
      totalCount: totalTableCount,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(totalTableCount / limit)),
    },
  };
}
