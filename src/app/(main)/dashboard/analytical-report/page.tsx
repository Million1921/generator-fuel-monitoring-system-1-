import { getAnalyticalReport } from "@/features/analytics/queries"
import { AnalyticalReportTable } from "@/features/analytics/components/AnalyticalReportTable"

export const dynamic = "force-dynamic"

export default async function AnalyticalReportPage(props: { 
  searchParams: Promise<{ 
    region?: string; 
    page?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }> 
}) {
  const searchParams = await props.searchParams;
  const region = searchParams.region;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const sortBy = searchParams.sortBy || 'siteId';
  const sortOrder = searchParams.sortOrder || 'asc';
  
  const { data, total } = await getAnalyticalReport(region, page, 10, sortBy, sortOrder);

  return (
    <div className="flex flex-col gap-6 px-6 pb-6 overflow-x-auto overflow-y-hidden">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-neutral-100">Analytical Consumption Report</h1>
          <p className="text-muted-foreground">
            Monitor real-time fuel consumption, cost analysis, and site variance tracking.
          </p>
        </div>

        <AnalyticalReportTable data={data} total={total} page={page} sortBy={sortBy} sortOrder={sortOrder} />
    </div>
  )
}
