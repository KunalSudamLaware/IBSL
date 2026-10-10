"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  IndianRupee,
  Users,
  UserCheck,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Minus,
  MessageSquare,
  Calendar,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/format";
import {
  AnalyticsReportData,
  PeriodFilter,
  MetricComparison,
  TransactionItem,
} from "@/modules/analytics/types";

interface AnalyticsClientProps {
  initialData: AnalyticsReportData;
}

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  this_month: "This Month",
  last_month: "Last Month",
  last_3_months: "Last 3 Months",
  last_6_months: "Last 6 Months",
  last_12_months: "Last 12 Months",
  custom: "Custom Range",
};

export function AnalyticsClient({ initialData }: AnalyticsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Search input state
  const currentSearch = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Custom date inputs
  const [customFrom, setCustomFrom] = useState(
    initialData.dateRange.customFrom || initialData.dateRange.startDate.slice(0, 10)
  );
  const [customTo, setCustomTo] = useState(
    initialData.dateRange.customTo || initialData.dateRange.endDate.slice(0, 10)
  );
  const [showCustomPicker, setShowCustomPicker] = useState(initialData.period === "custom");

  // Chart Metric Active Tab
  const [chartMetric, setChartMetric] = useState<"revenue" | "purchases" | "payments">("revenue");
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Status Filter State
  const currentStatus = searchParams.get("status") || "ALL";

  // Helper to push query updates
  const updateQueryParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || val === undefined) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    startTransition(() => {
      router.push(`/admin/analytics?${params.toString()}`);
    });
  };

  const handlePeriodChange = (period: PeriodFilter) => {
    if (period === "custom") {
      setShowCustomPicker(true);
      return;
    }
    setShowCustomPicker(false);
    updateQueryParams({
      period,
      from: null,
      to: null,
      page: "1",
    });
  };

  const handleApplyCustomDateRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFrom || !customTo) {
      alert("Please select both From and To dates.");
      return;
    }
    updateQueryParams({
      period: "custom",
      from: customFrom,
      to: customTo,
      page: "1",
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({
      search: searchInput.trim() || null,
      page: "1",
    });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    updateQueryParams({
      search: null,
      page: "1",
    });
  };

  const handleStatusFilterChange = (status: string) => {
    updateQueryParams({
      status: status === "ALL" ? null : status,
      page: "1",
    });
  };

  const handlePageChange = (newPage: number) => {
    updateQueryParams({
      page: String(newPage),
    });
  };

  // Metric Comparison Badge Component
  const renderComparisonBadge = (metric: MetricComparison, isCurrency: boolean = false) => {
    const isUp = metric.direction === "up";
    const isDown = metric.direction === "down";

    const badgeStyle = isUp
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : isDown
      ? "bg-rose-50 text-rose-800 border-rose-200"
      : "bg-stone-100 text-stone-600 border-stone-200";

    const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

    const formattedPrev = isCurrency
      ? formatPrice(metric.previous)
      : metric.previous.toLocaleString("en-IN");

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${badgeStyle}`}
        >
          <Icon className="w-3 h-3" />
          <span>{metric.percentChange !== null ? `${metric.percentChange > 0 ? "+" : ""}${metric.percentChange}%` : "N/A"}</span>
        </span>
        <span className="text-[11px] text-stone-400 font-medium">
          vs prev ({formattedPrev})
        </span>
      </div>
    );
  };

  // Helper for status badge styling
  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PAID":
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-800 border-emerald-250/50 font-bold text-[10px] uppercase tracking-wider"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600 inline mr-1" />
            {status}
          </Badge>
        );
      case "PENDING":
      case "PROCESSING":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-800 border-amber-250/50 font-bold text-[10px] uppercase tracking-wider"
          >
            <Clock className="w-3 h-3 text-amber-600 inline mr-1" />
            {status}
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge
            variant="outline"
            className="bg-stone-100 text-stone-700 border-stone-300 font-bold text-[10px] uppercase tracking-wider"
          >
            <RotateCcw className="w-3 h-3 text-stone-500 inline mr-1" />
            Refunded
          </Badge>
        );
      case "FAILED":
      case "CANCELLED":
        return (
          <Badge
            variant="outline"
            className="bg-rose-50 text-rose-800 border-rose-250/50 font-bold text-[10px] uppercase tracking-wider"
          >
            <XCircle className="w-3 h-3 text-rose-600 inline mr-1" />
            {status}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            {status}
          </Badge>
        );
    }
  };

  // Chart Calculations
  const chartPoints = initialData.chartPoints;
  const maxRevenue = Math.max(...chartPoints.map((p) => p.revenue), 1000);
  const maxPurchases = Math.max(...chartPoints.map((p) => p.purchases), 5);
  const maxPayments = Math.max(...chartPoints.map((p) => p.successfulPayments), 5);

  const activeMax =
    chartMetric === "revenue"
      ? maxRevenue
      : chartMetric === "purchases"
      ? maxPurchases
      : maxPayments;

  const totalChartRevenue = chartPoints.reduce((sum, p) => sum + p.revenue, 0);
  const totalChartPurchases = chartPoints.reduce((sum, p) => sum + p.purchases, 0);
  const totalChartPayments = chartPoints.reduce((sum, p) => sum + p.successfulPayments, 0);

  // Peak month
  const peakPoint = [...chartPoints].sort((a, b) => {
    if (chartMetric === "revenue") return b.revenue - a.revenue;
    if (chartMetric === "purchases") return b.purchases - a.purchases;
    return b.successfulPayments - a.successfulPayments;
  })[0];

  return (
    <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-[#FAF9F6] text-slate-900 antialiased font-sans">
      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP BREADCRUMB & HEADER */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="text-[11px] font-bold uppercase tracking-widest text-[#b89047] mb-2 flex items-center gap-1.5">
          <Link href="/admin/dashboard" className="hover:text-slate-900 transition-colors">
            Admin
          </Link>
          <span className="text-stone-300">/</span>
          <span className="text-slate-900">Reports & Analytics</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <h1 className="text-3xl font-serif text-slate-900 font-normal tracking-tight">
              Reports & Analytics
            </h1>
            <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider mt-1">
              Performance metrics, sales intelligence, and period comparisons
            </p>
          </div>

          {/* Current Active Date Range Display */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-stone-200 px-3.5 py-2 rounded-lg shadow-sm text-xs">
              <Calendar className="w-4 h-4 text-[#b89047] shrink-0" />
              <div>
                <span className="font-bold text-slate-900">
                  {initialData.dateRange.startDateDisplay} – {initialData.dateRange.endDateDisplay}
                </span>
                <span className="text-stone-400 block text-[10px] font-medium">
                  Previous: {initialData.previousDateRange.startDateDisplay} –{" "}
                  {initialData.previousDateRange.endDateDisplay}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => updateQueryParams({})}
              disabled={isPending}
              className="text-xs font-bold uppercase tracking-wider bg-white border-stone-200 hover:bg-stone-50 text-slate-700"
            >
              <RotateCcw className={`w-3.5 h-3.5 mr-1 ${isPending ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 2. DATE RANGE FILTER BAR */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="bg-white border border-stone-200 rounded-xl p-4 md:p-5 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            <Filter className="w-4 h-4 text-[#b89047]" />
            <span>Select Period:</span>
          </div>

          {/* Period Filter Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["this_month", "last_month", "last_3_months", "last_6_months", "last_12_months"] as PeriodFilter[]).map(
              (p) => {
                const isActive = initialData.period === p && !showCustomPicker;
                return (
                  <button
                    key={p}
                    onClick={() => handlePeriodChange(p)}
                    disabled={isPending}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#b89047] text-white shadow-sm ring-1 ring-[#b89047]"
                        : "bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200"
                    }`}
                  >
                    {PERIOD_LABELS[p]}
                  </button>
                );
              }
            )}

            <button
              onClick={() => handlePeriodChange("custom")}
              disabled={isPending}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                showCustomPicker || initialData.period === "custom"
                  ? "bg-slate-900 text-white shadow-sm ring-1 ring-slate-900"
                  : "bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200"
              }`}
            >
              Custom Range
            </button>
          </div>
        </div>

        {/* Custom Date Inputs (Expands when Custom Range is active) */}
        {showCustomPicker && (
          <form
            onSubmit={handleApplyCustomDateRange}
            className="mt-4 pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-end gap-3 animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <div className="w-full sm:w-auto">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">
                From Date
              </label>
              <Input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                required
                className="text-xs bg-white border-stone-300 font-mono"
              />
            </div>

            <div className="w-full sm:w-auto">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">
                To Date
              </label>
              <Input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                required
                className="text-xs bg-white border-stone-300 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <Button
                type="submit"
                disabled={isPending}
                size="sm"
                className="bg-[#b89047] hover:bg-[#a37f3c] text-white text-xs font-bold uppercase tracking-wider px-4 h-8"
              >
                Apply Range
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handlePeriodChange("this_month")}
                className="text-xs text-stone-500 hover:text-slate-900 h-8"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 3. SIX SUMMARY METRIC CARDS WITH PERIOD-OVER-PERIOD COMPARISON */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {/* Card 1: Total Revenue */}
        <div className="bg-white border border-stone-200 hover:border-[#b89047]/40 hover:shadow-md transition-all duration-300 rounded-xl p-6 flex flex-col justify-between group shadow-sm">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Total Revenue
            </span>
            <div className="p-2 rounded-lg border border-stone-100 bg-stone-50/60 text-[#b89047] group-hover:scale-105 transition-transform">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
              {formatPrice(initialData.summary.totalRevenue.current)}
            </div>
            <div className="mt-3">
              {renderComparisonBadge(initialData.summary.totalRevenue, true)}
            </div>
            <p className="text-[10px] text-stone-400 font-medium mt-2">
              Sum of verified payments in period (excludes pending & cancelled)
            </p>
          </div>
        </div>

        {/* Card 2: Design Purchases */}
        <div className="bg-white border border-stone-200 hover:border-[#b89047]/40 hover:shadow-md transition-all duration-300 rounded-xl p-6 flex flex-col justify-between group shadow-sm">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Design Purchases
            </span>
            <div className="p-2 rounded-lg border border-stone-100 bg-stone-50/60 text-slate-800 group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
              {initialData.summary.designPurchases.current.toLocaleString("en-IN")}
            </div>
            <div className="mt-3">
              {renderComparisonBadge(initialData.summary.designPurchases)}
            </div>
            <p className="text-[10px] text-stone-400 font-medium mt-2">
              Total successful design package orders completed
            </p>
          </div>
        </div>

        {/* Card 3: Average Order Value (AOV) */}
        <div className="bg-white border border-stone-200 hover:border-[#b89047]/40 hover:shadow-md transition-all duration-300 rounded-xl p-6 flex flex-col justify-between group shadow-sm">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Average Order Value (AOV)
            </span>
            <div className="p-2 rounded-lg border border-stone-100 bg-stone-50/60 text-[#b89047] group-hover:scale-105 transition-transform">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
              {formatPrice(initialData.summary.averageOrderValue.current)}
            </div>
            <div className="mt-3">
              {renderComparisonBadge(initialData.summary.averageOrderValue, true)}
            </div>
            <p className="text-[10px] text-stone-400 font-medium mt-2">
              Total revenue divided by successful purchases
            </p>
          </div>
        </div>

        {/* Card 4: Customers Who Paid */}
        <div className="bg-white border border-stone-200 hover:border-[#b89047]/40 hover:shadow-md transition-all duration-300 rounded-xl p-6 flex flex-col justify-between group shadow-sm">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Customers Who Paid
            </span>
            <div className="p-2 rounded-lg border border-stone-100 bg-stone-50/60 text-emerald-600 group-hover:scale-105 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
              {initialData.summary.paidCustomers.current.toLocaleString("en-IN")}
            </div>
            <div className="mt-3">
              {renderComparisonBadge(initialData.summary.paidCustomers)}
            </div>
            <p className="text-[10px] text-stone-400 font-medium mt-2">
              Unique customers with verified successful payments
            </p>
          </div>
        </div>

        {/* Card 5: Total Customers Registered */}
        <div className="bg-white border border-stone-200 hover:border-[#b89047]/40 hover:shadow-md transition-all duration-300 rounded-xl p-6 flex flex-col justify-between group shadow-sm">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Total Customers
            </span>
            <div className="p-2 rounded-lg border border-stone-100 bg-stone-50/60 text-slate-700 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
              {initialData.summary.totalCustomers.current.toLocaleString("en-IN")}
            </div>
            <div className="mt-3">
              {renderComparisonBadge(initialData.summary.totalCustomers)}
            </div>
            <p className="text-[10px] text-stone-400 font-medium mt-2">
              New customer accounts registered in selected period
            </p>
          </div>
        </div>

        {/* Card 6: Consultation Requests */}
        <div className="bg-white border border-stone-200 hover:border-[#b89047]/40 hover:shadow-md transition-all duration-300 rounded-xl p-6 flex flex-col justify-between group shadow-sm">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Consultation Requests
            </span>
            <div className="p-2 rounded-lg border border-stone-100 bg-stone-50/60 text-[#b89047] group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
              {initialData.summary.consultationRequests.current.toLocaleString("en-IN")}
            </div>
            <div className="mt-3">
              {renderComparisonBadge(initialData.summary.consultationRequests)}
            </div>
            <p className="text-[10px] text-stone-400 font-medium mt-2">
              Client architect consultation inquiries received
            </p>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 4. RESPONSIVE MONTHLY CHARTS */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="bg-white border border-stone-200 rounded-xl p-6 md:p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-900">
              Monthly Trends & Analytics
            </h2>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Breakdown of revenue, design purchases, and payments over time
            </p>
          </div>

          {/* Chart Metric Switcher */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
            <button
              onClick={() => setChartMetric("revenue")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                chartMetric === "revenue"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-stone-500 hover:text-slate-900"
              }`}
            >
              Revenue (₹)
            </button>
            <button
              onClick={() => setChartMetric("purchases")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                chartMetric === "purchases"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-stone-500 hover:text-slate-900"
              }`}
            >
              Purchases
            </button>
            <button
              onClick={() => setChartMetric("payments")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                chartMetric === "payments"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-stone-500 hover:text-slate-900"
              }`}
            >
              Payments
            </button>
          </div>
        </div>

        {/* Quick Highlights Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-b border-stone-100 text-xs">
          <div>
            <span className="text-stone-400 uppercase tracking-wider font-semibold block text-[10px]">
              Chart Window Total
            </span>
            <span className="font-bold text-slate-900 text-sm">
              {chartMetric === "revenue"
                ? formatPrice(totalChartRevenue)
                : chartMetric === "purchases"
                ? `${totalChartPurchases} Purchases`
                : `${totalChartPayments} Payments`}
            </span>
          </div>
          <div>
            <span className="text-stone-400 uppercase tracking-wider font-semibold block text-[10px]">
              Peak Performing Month
            </span>
            <span className="font-bold text-[#b89047] text-sm">
              {peakPoint ? (
                <>
                  {peakPoint.label} (
                  {chartMetric === "revenue"
                    ? formatPrice(peakPoint.revenue)
                    : chartMetric === "purchases"
                    ? `${peakPoint.purchases}`
                    : `${peakPoint.successfulPayments}`}
                  )
                </>
              ) : (
                "N/A"
              )}
            </span>
          </div>
          <div>
            <span className="text-stone-400 uppercase tracking-wider font-semibold block text-[10px]">
              Monthly Average
            </span>
            <span className="font-bold text-slate-900 text-sm">
              {chartMetric === "revenue"
                ? formatPrice(Math.round(totalChartRevenue / Math.max(chartPoints.length, 1)))
                : (
                    (chartMetric === "purchases" ? totalChartPurchases : totalChartPayments) /
                    Math.max(chartPoints.length, 1)
                  ).toFixed(1) + " / mo"}
            </span>
          </div>
        </div>

        {/* SVG Interactive Chart Visual */}
        <div className="mt-8 relative">
          <div className="h-64 sm:h-72 w-full flex items-end gap-2 sm:gap-4 pt-8 pb-8 px-2 border-b border-stone-200">
            {chartPoints.map((point, idx) => {
              const val =
                chartMetric === "revenue"
                  ? point.revenue
                  : chartMetric === "purchases"
                  ? point.purchases
                  : point.successfulPayments;

              const heightPercent = activeMax > 0 ? Math.max((val / activeMax) * 100, 3) : 3;
              const isHovered = hoveredPointIndex === idx;

              return (
                <div
                  key={point.monthKey}
                  className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                >
                  {/* Floating Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-16 z-30 bg-slate-900 text-white rounded-lg p-2 shadow-xl text-center pointer-events-none whitespace-nowrap border border-stone-700 animate-in fade-in duration-150">
                      <div className="font-bold text-xs text-[#b89047]">{point.label}</div>
                      <div className="text-[11px] font-mono mt-0.5">
                        {chartMetric === "revenue" && formatPrice(point.revenue)}
                        {chartMetric === "purchases" && `${point.purchases} Purchases`}
                        {chartMetric === "payments" && `${point.successfulPayments} Payments`}
                      </div>
                      <div className="text-[9px] text-stone-400 mt-0.5">
                        Rev: {formatPrice(point.revenue)} • {point.purchases} orders
                      </div>
                    </div>
                  )}

                  {/* Value label on top of bar */}
                  {val > 0 && (
                    <span className="text-[10px] font-mono font-bold text-slate-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {chartMetric === "revenue" ? `₹${(val / 1000).toFixed(0)}k` : val}
                    </span>
                  )}

                  {/* Bar */}
                  <div className="w-full max-w-[48px] bg-stone-100 rounded-t-md overflow-hidden flex items-end h-full">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        chartMetric === "revenue"
                          ? isHovered
                            ? "bg-[#b89047]"
                            : "bg-[#b89047]/85"
                          : chartMetric === "purchases"
                          ? isHovered
                            ? "bg-slate-900"
                            : "bg-slate-800/85"
                          : isHovered
                          ? "bg-emerald-600"
                          : "bg-emerald-500/85"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Month Label */}
                  <span
                    className={`mt-3 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                      isHovered ? "text-[#b89047]" : "text-stone-500"
                    }`}
                  >
                    {point.shortLabel}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Reference grid markers */}
          <div className="absolute top-0 right-0 left-0 h-64 pointer-events-none flex flex-col justify-between opacity-15">
            <div className="border-b border-dashed border-stone-600 w-full" />
            <div className="border-b border-dashed border-stone-600 w-full" />
            <div className="border-b border-dashed border-stone-600 w-full" />
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 5. TRANSACTION & PURCHASE DETAILS TABLE */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="bg-white border border-stone-200 rounded-xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-stone-150">
          <div>
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-900">
              Transactions & Purchase Details
            </h2>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Verified order records matching the active date window ({initialData.tableData.totalCount} total)
            </p>
          </div>

          {/* Controls: Search & Status Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input Form */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search orders, clients, designs..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-8 text-xs w-full sm:w-64 bg-stone-50/50 border-stone-300 rounded-lg h-9"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 text-stone-400 hover:text-slate-700 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </form>

            {/* Status Filter Dropdown / Buttons */}
            <select
              value={currentStatus}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="text-xs font-bold uppercase tracking-wider bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-slate-700 outline-none h-9 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Successful (Paid & Completed)</option>
              <option value="PAID">Paid</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto mt-4">
          <Table>
            <TableHeader className="bg-stone-50/75">
              <TableRow className="border-b border-stone-200">
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-700 py-3.5">
                  Order ID
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-700 py-3.5">
                  Customer Name
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-700 py-3.5">
                  Design Name
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-700 py-3.5">
                  Purchase Date
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-700 py-3.5">
                  Status
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-700 py-3.5 text-right">
                  Amount
                </TableHead>
                <TableHead className="w-12 py-3.5"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.tableData.transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <AlertCircle className="w-8 h-8 text-stone-300 stroke-1 mx-auto mb-2" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                      No transactions found
                    </h3>
                    <p className="text-xs text-stone-450 mt-1 uppercase font-semibold tracking-wider">
                      No order records match the selected date range and filter criteria.
                    </p>
                    {(searchInput || currentStatus !== "ALL") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchInput("");
                          updateQueryParams({ search: null, status: null, page: "1" });
                        }}
                        className="mt-4 text-xs font-bold uppercase tracking-wider"
                      >
                        Reset Search & Status
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                initialData.tableData.transactions.map((tx: TransactionItem) => {
                  const txDate = new Date(tx.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <TableRow key={tx.id} className="border-b border-stone-100 hover:bg-stone-50/60 transition-colors">
                      {/* Order ID */}
                      <TableCell className="text-xs font-semibold uppercase tracking-wider font-mono py-4 text-[#b89047]">
                        <Link
                          href={`/admin/orders/${tx.id}`}
                          className="hover:underline flex items-center gap-1"
                        >
                          {tx.orderId}
                          <ExternalLink className="w-3 h-3 opacity-60 inline" />
                        </Link>
                      </TableCell>

                      {/* Customer Name & Email */}
                      <TableCell className="py-4">
                        <div className="text-xs font-bold text-slate-900">{tx.customerName}</div>
                        <div className="text-[11px] text-stone-400 font-mono">{tx.customerEmail}</div>
                      </TableCell>

                      {/* Design Title */}
                      <TableCell className="text-xs font-medium text-slate-800 py-4 max-w-[220px] truncate">
                        {tx.designTitle}
                      </TableCell>

                      {/* Purchase Date */}
                      <TableCell className="text-xs font-medium text-stone-500 py-4">
                        {txDate}
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="py-4">
                        {getStatusBadge(tx.status)}
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="text-right text-xs font-bold text-slate-900 py-4 font-mono">
                        {formatPrice(tx.amountInr)}
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right py-4">
                        <Link
                          href={`/admin/orders/${tx.id}`}
                          className="text-[10px] font-bold uppercase tracking-widest text-slate-700 hover:text-[#b89047] transition-colors"
                        >
                          Manage
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        {initialData.tableData.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-stone-100 mt-4">
            <div className="text-xs text-stone-500 font-medium">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {(initialData.tableData.page - 1) * initialData.tableData.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-slate-900">
                {Math.min(
                  initialData.tableData.page * initialData.tableData.limit,
                  initialData.tableData.totalCount
                )}
              </span>{" "}
              of <span className="font-bold text-slate-900">{initialData.tableData.totalCount}</span> transactions
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(initialData.tableData.page - 1)}
                disabled={initialData.tableData.page <= 1 || isPending}
                className="text-xs font-bold uppercase tracking-wider h-8"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Prev
              </Button>

              {/* Page Number Pills */}
              {Array.from({ length: initialData.tableData.totalPages }, (_, i) => i + 1).map((pg) => {
                // Show first, last, and pages close to current
                if (
                  pg === 1 ||
                  pg === initialData.tableData.totalPages ||
                  Math.abs(pg - initialData.tableData.page) <= 1
                ) {
                  const isCurrent = pg === initialData.tableData.page;
                  return (
                    <button
                      key={pg}
                      onClick={() => handlePageChange(pg)}
                      disabled={isPending}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-[#b89047] text-white"
                          : "bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200"
                      }`}
                    >
                      {pg}
                    </button>
                  );
                }
                if (
                  pg === 2 &&
                  initialData.tableData.page > 3
                ) {
                  return <span key="ellipsis-1" className="text-stone-400 px-1">...</span>;
                }
                if (
                  pg === initialData.tableData.totalPages - 1 &&
                  initialData.tableData.page < initialData.tableData.totalPages - 2
                ) {
                  return <span key="ellipsis-2" className="text-stone-400 px-1">...</span>;
                }
                return null;
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(initialData.tableData.page + 1)}
                disabled={initialData.tableData.page >= initialData.tableData.totalPages || isPending}
                className="text-xs font-bold uppercase tracking-wider h-8"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
