import { Fuel, Building2, MapPin, AlertTriangle, TrendingUp, Zap, BarChart3, ChevronLeft, ChevronRight } from "lucide-react"
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table"
import prisma from "@/lib/db"
import { ConsumptionChart } from "@/features/analytics/components/ConsumptionChart"
import { APP_CONFIG } from "@/lib/config"
import { Pagination } from "@/components/ui/Pagination"
import { Input } from "@/components/ui/input"
import Link from "next/link"

async function getDashboardData(region?: string, topSitesPage: number = 1) {
  const topSitesLimit = 10
  const skip = (topSitesPage - 1) * topSitesLimit

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const siteFilter = region ? { region } : {}
  const fuelRequestFilter = region ? { site: { region } } : {}
  const fuelRefillFilter = region ? { site: { region } } : {}
  const generatorFilter = region ? { site: { region } } : {}

  // Total sites
  const totalSites = await prisma.site.count({ where: siteFilter })

  // Total distinct regions
  const regionsRaw = await prisma.site.findMany({
    select: { region: true },
    distinct: ['region'],
    where: siteFilter,
  })
  const totalRegions = regionsRaw.filter(r => r.region).length

  // Refueled this month (sum of fuelDelivered from FuelRefill this month)
  const refueledThisMonthAgg = await prisma.fuelRefill.aggregate({
    _sum: { fuelDelivered: true },
    where: {
      refillDate: { gte: startOfMonth },
      ...fuelRefillFilter,
    },
  })
  const refueledThisMonth = refueledThisMonthAgg._sum.fuelDelivered ?? 0

  // Pending requests (low-fuel alerts equivalent)
  const lowFuelAlerts = await prisma.fuelRequest.count({
    where: {
      status: { in: ['PENDING_SUPERVISOR', 'PENDING_MANAGER'] },
      ...fuelRequestFilter,
    },
  })

  // High consumption generators (stdFuelConsumption above average)
  const allGenerators = await prisma.generator.findMany({
    select: { stdFuelConsumption: true },
    where: { 
      stdFuelConsumption: { gt: 0 },
      ...generatorFilter,
    },
  })
  const avgConsumption = allGenerators.length > 0
    ? allGenerators.reduce((s, g) => s + (g.stdFuelConsumption ?? 0), 0) / allGenerators.length
    : 0

  const highConsumptionCount = await prisma.generator.count({
    where: { 
      stdFuelConsumption: { gt: avgConsumption * APP_CONFIG.HIGH_CONSUMPTION_THRESHOLD_MULTIPLIER },
      ...generatorFilter,
    },
  })

  // Top frequently fueled sites (by fuel refill count)
  const topSitesRaw = await prisma.fuelRefill.groupBy({
    by: ['siteId'],
    _count: { id: true },
    _sum: { fuelDelivered: true },
    where: { 
      ...fuelRefillFilter,
    },
    orderBy: { _count: { id: 'desc' } },
    take: topSitesLimit,
    skip: skip,
  })

  // Count total unique sites refueled for pagination
  const totalTopSitesGroups = await prisma.fuelRefill.groupBy({
    by: ['siteId'],
    where: { 
      ...fuelRefillFilter,
    },
  })
  const totalTopSites = totalTopSitesGroups.length
  const topSitesTotalPages = Math.ceil(totalTopSites / topSitesLimit)

  const topSiteIds = topSitesRaw.map(r => r.siteId)
  const topSiteDetails = await prisma.site.findMany({
    where: { 
      id: { in: topSiteIds },
      ...siteFilter,
    },
    select: { id: true, siteId: true, name: true, region: true },
  })

  const topSites = topSitesRaw.map(r => {
    const site = topSiteDetails.find(s => s.id === r.siteId)
    return {
      siteId: site?.siteId ?? '-',
      name: site?.name ?? 'Unknown',
      region: site?.region ?? '-',
      requestCount: r._count.id,
      totalFueled: r._sum.fuelDelivered ?? 0,
    }
  })


  // Monthly consumption trend (last 6 months)
  const monthlyTrend: { month: string, liters: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1)
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
    
    const monthlySum = await prisma.fuelRefill.aggregate({
      _sum: { fuelDelivered: true },
      where: {
        refillDate: { gte: monthStart, lte: monthEnd },
        ...fuelRefillFilter,
      },
    })
    
    monthlyTrend.push({
      month: d.toLocaleString('default', { month: 'short' }),
      liters: monthlySum._sum.fuelDelivered ?? 0,
    })
  }

  return {
    totalSites,
    totalRegions,
    refueledThisMonth,
    highConsumptionCount,
    avgConsumption,
    topSites,
    topSitesTotal: totalTopSites,
    topSitesTotalPages,
    monthlyTrend,
  }
}


export const dynamic = "force-dynamic"

export default async function DashboardPage(props: { searchParams: Promise<{ region?: string, page?: string }> }) {
  const searchParams = await props.searchParams;
  const region = searchParams.region;
  const topSitesPage = parseInt(searchParams.page || "1")
  const data = await getDashboardData(region, topSitesPage)

  const statCards = [
    {
      title: "Total Sites",
      value: data.totalSites.toString(),
      sub: "Monitored generator sites",
      icon: Building2,
      color: "text-lime-600",
      bg: "bg-lime-50 dark:bg-lime-900/20",
    },
    {
      title: "Total Regions",
      value: data.totalRegions.toString(),
      sub: "Coverage regions",
      icon: MapPin,
      color: "text-lime-700",
      bg: "bg-lime-100/50 dark:bg-lime-900/30",
    },
    {
      title: "Refueled This Month",
      value: `${data.refueledThisMonth.toLocaleString()} L`,
      sub: "Liters delivered (completed)",
      icon: Fuel,
      color: "text-lime-500",
      bg: "bg-lime-50 dark:bg-blue-950",
    },

    {
      title: "High Consumption Generators",
      value: data.highConsumptionCount.toString(),
      sub: `Above avg ${data.avgConsumption.toFixed(1)} L/hr`,
      icon: Zap,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950",
    },
    {
      title: "Completed Deliveries",
      value: (data.topSites?.reduce((s, t) => s + t.requestCount, 0) || 0).toString(),
      sub: "Total fuel delivery orders done",
      icon: TrendingUp,
      color: "text-lime-500",
      bg: "bg-lime-50 dark:bg-blue-950",
    },
  ]

  return (
    <>
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        {/* Stat Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card) => (
            <div key={card.title} className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
              <div className="flex flex-row items-center justify-between pb-3">
                <h3 className="text-sm font-medium tracking-tight text-muted-foreground">{card.title}</h3>
                <div className={`rounded-xl p-3 ${card.bg}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} strokeWidth={2.5} />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight text-slate-900">{card.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Trend Chart */}
        <div className="grid gap-4">
          <ConsumptionChart data={data.monthlyTrend} />
        </div>

        {/* Two panel row */}
        <div className="grid gap-4">
          {/* Top Frequently Fueled Sites */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b px-5 py-4 bg-white">
              <TrendingUp className="h-6 w-6 text-lime-600" strokeWidth={2.5} />
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-tight">Frequently Fueled Sites</h3>
            </div>
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="bg-white sticky top-0 z-10 border-b border-gray-200">
                  <TableRow className="hover:bg-transparent bg-gray-50/50 h-8">
                    <TableHead className="px-4 font-bold text-slate-900 text-[13px] uppercase tracking-tight">Site Name</TableHead>
                    <TableHead className="px-4 font-bold text-slate-900 text-[13px] uppercase tracking-tight">Site ID</TableHead>
                    <TableHead className="px-4 font-bold text-slate-900 text-[13px] uppercase tracking-tight">Region</TableHead>
                    <TableHead className="text-right px-4 font-bold text-slate-900 text-[13px] uppercase tracking-tight">Deliveries</TableHead>
                    <TableHead className="text-right px-4 font-bold text-slate-900 text-[13px] uppercase tracking-tight">Total Fuel</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topSites.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
                        No completed deliveries yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.topSites.map((site, i) => (
                      <TableRow key={site.siteId} className="border-b-gray-50 hover:bg-gray-50/50 transition-colors h-8">
                        <TableCell className="font-normal text-slate-900 px-4">
                          {site.name}
                        </TableCell>
                        <TableCell className="text-slate-500 font-mono text-[13px] px-4">
                          {site.siteId}
                        </TableCell>
                        <TableCell className="text-slate-500 px-4">
                          {site.region}
                        </TableCell>
                        <TableCell className="text-right font-medium text-slate-700 px-4">
                          {site.requestCount}x
                        </TableCell>
                        <TableCell className="text-right font-normal text-slate-600 px-4">
                          {site.totalFueled.toLocaleString()} L
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Standardized Footer with Pagination */}
            <div className="flex items-center justify-between border-t border-slate-400 bg-white px-4 py-1.5 sm:px-6">
              <div className="flex items-center text-gray-500 gap-4 uppercase tracking-tighter text-sm font-medium">
                <span className="hidden sm:inline-block font-bold">{data.topSitesTotal} total sites</span>
                <span className="hidden sm:inline-block">|</span>
                <div className="flex items-center gap-2">
                  <span>Go to:</span>
                  <form action="" method="get" className="flex items-center gap-2">
                    {region && <input type="hidden" name="region" value={region} />}
                    <Input
                      name="page"
                      type="number"
                      defaultValue={topSitesPage}
                      className="h-7 w-12 text-center font-bold bg-gray-50 border-gray-200 p-0 focus-visible:ring-1 focus-visible:ring-lime-500 shadow-none"
                    />
                  </form>
                </div>
              </div>
              <Pagination totalPages={data.topSitesTotalPages} currentPage={topSitesPage} />
            </div>
          </div>
        </div>
      </div>
    </>
  )

}
