export type PeriodFilter =
  | "this_month"
  | "last_month"
  | "last_3_months"
  | "last_6_months"
  | "last_12_months"
  | "custom";

export interface MetricComparison {
  current: number;
  previous: number;
  percentChange: number | null; // null if previous was 0 and current is 0
  direction: "up" | "down" | "flat";
  label: string;
}

export interface AnalyticsSummary {
  totalCustomers: MetricComparison;
  paidCustomers: MetricComparison;
  designPurchases: MetricComparison;
  totalRevenue: MetricComparison;
  averageOrderValue: MetricComparison;
  consultationRequests: MetricComparison;
}

export interface MonthlyChartPoint {
  monthKey: string; // YYYY-MM
  label: string;    // e.g. "Oct 2026"
  shortLabel: string; // e.g. "Oct"
  revenue: number;
  purchases: number;
  successfulPayments: number;
}

export interface TransactionItem {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  designTitle: string;
  amountInr: number;
  status: string;
  createdAt: string;
}

export interface TransactionTableData {
  transactions: TransactionItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AnalyticsReportData {
  period: PeriodFilter;
  dateRange: {
    startDate: string; // ISO
    endDate: string;   // ISO
    startDateDisplay: string;
    endDateDisplay: string;
    customFrom?: string;
    customTo?: string;
  };
  previousDateRange: {
    startDate: string;
    endDate: string;
    startDateDisplay: string;
    endDateDisplay: string;
  };
  summary: AnalyticsSummary;
  chartPoints: MonthlyChartPoint[];
  tableData: TransactionTableData;
}
