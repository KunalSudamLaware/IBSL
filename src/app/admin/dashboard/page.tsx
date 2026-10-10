import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IndianRupee, ShoppingCart, LayoutGrid, Activity, Calendar, RefreshCcw, Plus, Users, Settings, ArrowRight, FolderOpen, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardFilter } from "./DashboardFilter";
import { formatPrice } from "@/lib/format";

type Props = {
  searchParams: Promise<{ range?: string }>;
};

export default async function AdminDashboardPage(props: Props) {
  const searchParams = await props.searchParams;
  const range = searchParams.range || "last_30_days";

  const now = new Date();
  let gte: Date | undefined;
  let lte: Date | undefined;

  switch (range) {
    case "last_month": {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      gte = firstDay;
      lte = lastDay;
      break;
    }
    case "last_3_months": {
      gte = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    }
    case "last_6_months": {
      gte = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      break;
    }
    case "last_12_months": {
      gte = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    }
    case "this_year": {
      gte = new Date(now.getFullYear(), 0, 1);
      break;
    }
    case "all_time": {
      gte = undefined;
      break;
    }
    case "last_30_days":
    default: {
      gte = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    }
  }

  const dateFilter = gte ? { createdAt: { gte, ...(lte && { lte }) } } : {};
  const [
    totalRevenueAgg,
    totalSalesCount,
    activeCatalogItems,
    draftCatalogItems,
    archivedCatalogItems,
    recentOrders,
    totalOrdersCount,
    pendingOrdersCount,
    failedOrdersCount,
    refundedOrdersCount,
    featuredDesigns,
    uniqueCategoriesRaw,
    totalCustomers,
    totalReviews,
    totalConsultations,
    totalWishlists
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { amountInr: true },
      where: { status: "PAID", ...dateFilter },
    }),
    prisma.order.count({
      where: { status: "PAID", ...dateFilter },
    }),
    prisma.design.count({
      where: { status: "PUBLISHED" },
    }),
    prisma.design.count({
      where: { status: "DRAFT" },
    }),
    prisma.design.count({
      where: { status: "ARCHIVED" },
    }),
    prisma.order.findMany({
      where: dateFilter,
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { design: true },
    }),
    prisma.order.count({ where: dateFilter }),
    prisma.order.count({ where: { status: "PENDING", ...dateFilter } }),
    prisma.order.count({ where: { status: "FAILED", ...dateFilter } }),
    prisma.order.count({ where: { status: "REFUNDED", ...dateFilter } }),
    prisma.design.findMany({
      where: { status: "PUBLISHED" },
      take: 3,
      include: { images: { where: { isPrimary: true }, take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.design.groupBy({
      by: ['category'],
      _count: { id: true }
    }),
    prisma.user.count({ where: { role: "CUSTOMER", ...dateFilter } }),
    prisma.review.count({ where: dateFilter }),
    prisma.consultationRequest.count({ where: dateFilter }),
    prisma.wishlist.count({ where: dateFilter }),
  ]);

  const totalRevenue = totalRevenueAgg._sum.amountInr || 0;
  
  const conversionRate = totalOrdersCount > 0 
    ? ((totalSalesCount / totalOrdersCount) * 100).toFixed(1) 
    : "0.0";

  const totalCategoriesCount = uniqueCategoriesRaw.length;
  const categoriesList = uniqueCategoriesRaw.map(c => c.category).join(", ") || "House Plans, Villas, Duplexes";

  // Calculate order totals for percentage status bars
  const paidOrdersCount = totalSalesCount;
  const grandTotalOrders = totalOrdersCount || 1; // avoid division by zero

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 bg-[#FAF9F6] text-slate-900 antialiased font-sans">
      
      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 2. DASHBOARD HEADER */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <header className="mb-10 pb-6 border-b border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-slate-900 font-normal tracking-tight">Dashboard</h1>
            <p className="text-sm text-stone-500 font-semibold uppercase tracking-wider mt-1">Overview of your architectural marketplace</p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] font-bold text-stone-405 uppercase tracking-widest flex items-center gap-1.5 bg-white border border-stone-200 px-3 py-1.5 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-[#b89047]" /> Last updated: {new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            <DashboardFilter />
          </div>
        </div>
        <p className="text-xs text-stone-500 mt-4 italic font-semibold">
          Welcome back, Admin. Here&apos;s what&apos;s happening with Morya Designs.
        </p>
      </header>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 3. STATISTICS CARDS */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Metric 1: Revenue */}
        <div className="bg-white border border-stone-200 hover:border-[#b89047]/30 hover:shadow-md transition-all duration-300 rounded-lg p-6 flex flex-col justify-between group shadow-sm">
          <div className="flex items-center justify-between pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Revenue</span>
            <div className="p-1.5 rounded-lg border border-stone-100 bg-stone-50/40 text-stone-400 group-hover:text-[#b89047] group-hover:border-[#b89047]/20 transition-colors">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-slate-900">{formatPrice(totalRevenue)}</div>
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mt-2">
              {totalRevenue === 0 ? "No revenue recorded" : "Revenue from paid orders"}
            </p>
          </div>
        </div>

        {/* Metric 2: Sales */}
        <div className="bg-white border border-stone-200 hover:border-[#b89047]/30 hover:shadow-md transition-all duration-300 rounded-lg p-6 flex flex-col justify-between group shadow-sm">
          <div className="flex items-center justify-between pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Paid Orders</span>
            <div className="p-1.5 rounded-lg border border-stone-100 bg-stone-50/40 text-stone-400 group-hover:text-[#b89047] group-hover:border-[#b89047]/20 transition-colors">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-slate-900">{totalSalesCount}</div>
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mt-2">
              {totalOrdersCount} Total Orders
            </p>
          </div>
        </div>

        {/* Metric 3: Active Designs */}
        <Link 
          href="/admin/designs" 
          className="bg-white border border-stone-200 hover:border-[#b89047]/40 hover:shadow-md transition-all duration-300 rounded-lg p-6 flex flex-col justify-between group shadow-sm"
        >
          <div className="flex items-center justify-between pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Designs</span>
            <div className="p-1.5 rounded-lg border border-stone-100 bg-stone-50/40 text-stone-400 group-hover:text-[#b89047] group-hover:border-[#b89047]/20 transition-colors">
              <LayoutGrid className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-slate-900">{activeCatalogItems + draftCatalogItems + archivedCatalogItems}</div>
            <p className="text-[10px] font-bold text-[#b89047] uppercase tracking-widest mt-2 flex items-center gap-1">
              {activeCatalogItems} published <ArrowRight className="w-3.5 h-3.5" />
            </p>
          </div>
        </Link>

        {/* Metric 4: Customers */}
        <Link 
          href="/admin/customers"
          className="bg-white border border-stone-200 hover:border-[#b89047]/30 hover:shadow-md transition-all duration-300 rounded-lg p-6 flex flex-col justify-between group shadow-sm"
        >
          <div className="flex items-center justify-between pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Customers</span>
            <div className="p-1.5 rounded-lg border border-stone-100 bg-stone-50/40 text-stone-400 group-hover:text-[#b89047] group-hover:border-[#b89047]/20 transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-slate-900">{totalCustomers}</div>
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mt-2">
              Registered users
            </p>
          </div>
        </Link>
        
        {/* Metric 5: Consultations */}
        <Link 
          href="/admin/consultations"
          className="bg-white border border-stone-200 hover:border-[#b89047]/30 hover:shadow-md transition-all duration-300 rounded-lg p-6 flex flex-col justify-between group shadow-sm"
        >
          <div className="flex items-center justify-between pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Consultations</span>
            <div className="p-1.5 rounded-lg border border-stone-100 bg-stone-50/40 text-stone-400 group-hover:text-[#b89047] group-hover:border-[#b89047]/20 transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-slate-900">{totalConsultations}</div>
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mt-2">
              Total requests
            </p>
          </div>
        </Link>

        {/* Metric 6: Reviews */}
        <Link 
          href="/admin/reviews"
          className="bg-white border border-stone-200 hover:border-[#b89047]/30 hover:shadow-md transition-all duration-300 rounded-lg p-6 flex flex-col justify-between group shadow-sm"
        >
          <div className="flex items-center justify-between pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Reviews</span>
            <div className="p-1.5 rounded-lg border border-stone-100 bg-stone-50/40 text-stone-400 group-hover:text-[#b89047] group-hover:border-[#b89047]/20 transition-colors">
              <Settings className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-slate-900">{totalReviews}</div>
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mt-2">
              Total reviews
            </p>
          </div>
        </Link>
        
        {/* Metric 7: Wishlisted Items */}
        <div className="bg-white border border-stone-200 hover:border-[#b89047]/30 hover:shadow-md transition-all duration-300 rounded-lg p-6 flex flex-col justify-between group shadow-sm">
          <div className="flex items-center justify-between pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Wishlisted</span>
            <div className="p-1.5 rounded-lg border border-stone-100 bg-stone-50/40 text-stone-400 group-hover:text-[#b89047] group-hover:border-[#b89047]/20 transition-colors">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-slate-900">{totalWishlists}</div>
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mt-2">
              Total saved designs
            </p>
          </div>
        </div>

        {/* Metric 8: Conversion */}
        <div className="bg-white border border-stone-200 hover:border-[#b89047]/30 hover:shadow-md transition-all duration-300 rounded-lg p-6 flex flex-col justify-between group shadow-sm">
          <div className="flex items-center justify-between pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Conversion</span>
            <div className="p-1.5 rounded-lg border border-stone-100 bg-stone-50/40 text-stone-400 group-hover:text-[#b89047] group-hover:border-[#b89047]/20 transition-colors">
              <RefreshCcw className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-slate-900">{conversionRate}%</div>
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mt-2">
              Order conversion
            </p>
          </div>
        </div>

      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 4. OVERVIEW / ANALYTICS SECTION */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        
        {/* Left Column: Sales Overview Empty State Chart */}
        <div className="lg:col-span-8 bg-white border border-stone-200 rounded-lg p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">Sales Overview</h2>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold pb-4 border-b border-stone-100">Marketplace revenue index</p>
          </div>
          
          {/* Professional Empty State Chart Visual */}
          <div className="py-12 flex flex-col items-center justify-center text-center my-4 relative min-h-[220px]">
            {/* Grid graphic lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-2">
              <div className="border-b border-stone-300 w-full h-[1px]"></div>
              <div className="border-b border-stone-300 w-full h-[1px]"></div>
              <div className="border-b border-stone-300 w-full h-[1px]"></div>
              <div className="border-b border-stone-300 w-full h-[1px]"></div>
            </div>
            
            <FolderOpen className="w-8 h-8 text-stone-300 stroke-1 mb-3 relative z-10" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 relative z-10">No sales data yet</h3>
            <p className="text-[10px] text-stone-450 mt-1 uppercase font-semibold tracking-wider max-w-xs relative z-10">Sales charts will activate once orders are processed through Razorpay.</p>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-widest pt-4 border-t border-stone-100">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
        </div>

        {/* Right Column: Order Summary Progress Rows */}
        <div className="lg:col-span-4 bg-white border border-stone-200 rounded-lg p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">Order Summary</h2>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold pb-4 border-b border-stone-100">Status breakdown</p>
          </div>
          
          <div className="space-y-6 my-6">
            {/* Paid/Completed */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                <span>Completed</span>
                <span className="font-mono text-slate-900">{paidOrdersCount}</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#b89047] h-full" style={{ width: `${(paidOrdersCount / grandTotalOrders) * 100}%` }}></div>
              </div>
            </div>

            {/* Pending */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                <span>Pending</span>
                <span className="font-mono text-slate-900">{pendingOrdersCount}</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-450 h-full" style={{ width: `${(pendingOrdersCount / grandTotalOrders) * 100}%` }}></div>
              </div>
            </div>

            {/* Refunded */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                <span>Refunded</span>
                <span className="font-mono text-slate-900">{refundedOrdersCount}</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full" style={{ width: `${(refundedOrdersCount / grandTotalOrders) * 100}%` }}></div>
              </div>
            </div>

            {/* Cancelled/Failed */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                <span>Cancelled</span>
                <span className="font-mono text-slate-900">{failedOrdersCount}</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full" style={{ width: `${(failedOrdersCount / grandTotalOrders) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider pt-4 border-t border-stone-100 text-center">
            Total Orders Logged: {totalOrdersCount}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 7. QUICK ACTIONS */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="bg-white border border-stone-200 rounded-lg p-6 md:p-8 shadow-sm mb-10">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-6 pb-2 border-b border-stone-100">Quick Actions</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href="/admin/designs/new" 
            className="flex items-center justify-center gap-2 px-4 py-3 border border-stone-200 hover:border-[#b89047]/30 bg-stone-50/20 hover:bg-white text-xs font-bold tracking-widest uppercase transition-all duration-300 rounded-lg group text-slate-800 shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#b89047]" /> Add New Design
          </Link>
          <Link 
            href="/admin/designs" 
            className="flex items-center justify-center gap-2 px-4 py-3 border border-stone-200 hover:border-[#b89047]/30 bg-stone-50/20 hover:bg-white text-xs font-bold tracking-widest uppercase transition-all duration-300 rounded-lg group text-slate-800 shadow-sm"
          >
            <LayoutGrid className="w-4 h-4 text-[#b89047]" /> Manage Designs
          </Link>
          <Link 
            href="/admin/orders" 
            className="flex items-center justify-center gap-2 px-4 py-3 border border-stone-200 hover:border-[#b89047]/30 bg-stone-50/20 hover:bg-white text-xs font-bold tracking-widest uppercase transition-all duration-300 rounded-lg group text-slate-800 shadow-sm"
          >
            <ShoppingCart className="w-4 h-4 text-[#b89047]" /> View Orders
          </Link>
          <Link 
            href="/admin/customers" 
            className="flex items-center justify-center gap-2 px-4 py-3 border border-stone-200 hover:border-[#b89047]/30 bg-stone-50/20 hover:bg-white text-xs font-bold tracking-widest uppercase transition-all duration-300 rounded-lg group text-slate-800 shadow-sm"
          >
            <Users className="w-4 h-4 text-[#b89047]" /> View Customers
          </Link>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 5. RECENT ORDERS (Polished lists) */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="bg-white border border-stone-200 rounded-lg p-6 md:p-8 shadow-sm mb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-150">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Recent Orders</h2>
          <Link 
            href="/admin/orders" 
            className="text-xs font-semibold tracking-widest uppercase text-[#b89047] hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            View All Orders <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-8 h-8 text-stone-300 stroke-1 mb-3" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">No orders yet</h3>
            <p className="text-[10px] text-stone-450 mt-1 uppercase font-semibold tracking-wider max-w-sm mb-6">
              Once customers purchase a house plan, recent orders will appear here.
            </p>
            <Link 
              href="/admin/designs"
              className="inline-flex items-center justify-center px-6 py-2.5 border border-stone-300 hover:border-slate-800 text-xs font-bold tracking-widest uppercase transition-colors rounded-lg bg-white shadow-sm"
            >
              View Catalog
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader className="bg-stone-50">
                <TableRow className="border-b border-stone-200">
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-700 py-3">Order ID</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-700 py-3">Customer</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-700 py-3">Design</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-700 py-3">Date</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-700 py-3">Status</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-700 py-3 text-right">Amount</TableHead>
                  <th className="w-16 py-3"></th>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id} className="border-b border-stone-100 hover:bg-stone-50/40">
                    <TableCell className="text-xs font-semibold uppercase tracking-wider font-mono py-4 text-[#b89047]">
                      {order.invoiceNumber || `ID: ${order.id.slice(-6).toUpperCase()}`}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-stone-500 py-4">{order.email}</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800 py-4 truncate max-w-[200px]">{order.design.title}</TableCell>
                    <TableCell className="text-xs font-medium text-stone-500 py-4">
                      {order.createdAt.toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className={`rounded-md text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 ${
                        order.status === "PAID" 
                          ? "bg-emerald-50 text-emerald-800 border-emerald-250/20" 
                          : order.status === "REFUNDED" 
                          ? "bg-stone-100 text-stone-650 border-stone-250/20"
                          : "bg-amber-50 text-amber-800 border-amber-250/20"
                      }`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs font-bold text-slate-900 py-4">
                      {formatPrice(order.amountInr)}
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="text-[10px] font-bold uppercase tracking-widest text-slate-950 hover:text-[#b89047] transition-colors"
                      >
                        Manage
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 6. CATALOG OVERVIEW & CATEGORIES */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Catalog metrics (2/3 width equivalent) */}
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-lg p-6 md:p-8 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-6 pb-2 border-b border-stone-100">Catalog Overview</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-150 text-center">
              <span className="text-2xl font-serif font-bold text-[#b89047] block mb-1">{activeCatalogItems}</span>
              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Active Designs</span>
            </div>

            <div className="p-4 bg-stone-50 rounded-lg border border-stone-150 text-center">
              <span className="text-2xl font-serif font-bold text-slate-900 block mb-1">{draftCatalogItems}</span>
              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Draft Designs</span>
            </div>

            <div className="p-4 bg-stone-50 rounded-lg border border-stone-150 text-center">
              <span className="text-2xl font-serif font-bold text-rose-600 block mb-1">{archivedCatalogItems}</span>
              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Archived</span>
            </div>

            <div className="p-4 bg-stone-50 rounded-lg border border-stone-150 text-center">
              <span className="text-2xl font-serif font-bold text-slate-900 block mb-1">{totalCategoriesCount}</span>
              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Categories</span>
            </div>
          </div>
        </div>

        {/* Categories summary list */}
        <div className="bg-white border border-stone-200 rounded-lg p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-6 pb-2 border-b border-stone-100">Active Categories</h2>
            <div className="flex flex-wrap gap-2">
              {uniqueCategoriesRaw.map((cat, i) => (
                <Badge key={i} variant="secondary" className="bg-stone-50 border border-stone-200 text-stone-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md">
                  {cat.category} ({cat._count.id})
                </Badge>
              ))}
              {totalCategoriesCount === 0 && (
                <span className="text-xs text-stone-450 italic font-semibold uppercase tracking-wider">No active categories.</span>
              )}
            </div>
          </div>
          <p className="text-[9px] font-semibold text-stone-400 uppercase tracking-widest mt-6">
            Categories: {categoriesList}
          </p>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 8. FEATURED DESIGNS */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="bg-white border border-stone-200 rounded-lg p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-150">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Featured Designs</h2>
          <Link 
            href="/admin/designs" 
            className="text-xs font-semibold tracking-widest uppercase text-[#b89047] hover:text-slate-900 transition-colors"
          >
            Manage Catalog &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredDesigns.map((design) => {
            const primaryImage = design.images[0];
            return (
              <div 
                key={design.id} 
                className="group border border-stone-200 rounded-lg overflow-hidden hover:border-[#b89047]/30 hover:shadow-md transition-all duration-300 flex flex-col justify-between bg-stone-50/10"
              >
                {/* Image */}
                <div className="aspect-[16/10] overflow-hidden bg-stone-150 relative">
                  {primaryImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img 
                      src={primaryImage.url} 
                      alt={design.title} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <FolderOpen className="w-8 h-8 stroke-1" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-slate-900/90 text-white border-none rounded-md text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5">
                      {design.category}
                    </Badge>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="mb-3">
                    <h3 className="font-serif font-bold text-slate-900 group-hover:text-[#b89047] transition-colors truncate text-sm">
                      {design.title}
                    </h3>
                    <p className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider mt-1">
                      {design.bhk} BHK • {design.plotWidthFt}x{design.plotLengthFt} ft Plot
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{formatPrice(design.priceInr)}</span>
                    <Link 
                      href={`/admin/designs/${design.id}/edit`}
                      className="text-[10px] font-bold uppercase tracking-widest text-[#b89047] hover:text-slate-905 transition-all flex items-center gap-0.5"
                    >
                      Edit Design &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
          
          {featuredDesigns.length === 0 && (
            <div className="col-span-3 py-8 text-center text-stone-400 text-xs font-semibold uppercase tracking-widest italic">
              No published designs in the catalog.
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
