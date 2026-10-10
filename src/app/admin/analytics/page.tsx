import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAnalyticsReport } from "@/modules/analytics/queries";
import { PeriodFilter } from "@/modules/analytics/types";
import { AnalyticsClient } from "./AnalyticsClient";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export const metadata = {
  title: "Reports & Analytics | Morya Designs Admin",
  description: "Monthly reports, sales performance, revenue analytics, and transaction details",
};

export default async function AnalyticsPage(props: { searchParams: SearchParams }) {
  // 1. Strict Security & Admin Authorization Check
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  // 2. Resolve Search Params asynchronously (Next.js 15+ App Router contract)
  const searchParams = await props.searchParams;

  const rawPeriod = typeof searchParams.period === "string" ? searchParams.period : "this_month";
  const validPeriods: PeriodFilter[] = [
    "this_month",
    "last_month",
    "last_3_months",
    "last_6_months",
    "last_12_months",
    "custom",
  ];
  const period: PeriodFilter = validPeriods.includes(rawPeriod as PeriodFilter)
    ? (rawPeriod as PeriodFilter)
    : "this_month";

  const from = typeof searchParams.from === "string" ? searchParams.from : undefined;
  const to = typeof searchParams.to === "string" ? searchParams.to : undefined;
  const statusFilter = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined;
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;

  // 3. Query Analytics & Report Data
  const reportData = await getAnalyticsReport({
    period,
    from,
    to,
    statusFilter,
    search,
    page: isNaN(page) ? 1 : page,
    limit: 10,
  });

  return <AnalyticsClient initialData={reportData} />;
}
