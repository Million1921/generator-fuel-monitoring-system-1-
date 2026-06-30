import prisma from "@/lib/db"
import { FileText, CheckCircle2, Shield, Settings } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FuelRequestHeader } from "@/features/fuel-requests/components/FuelRequestHeader"
import { FuelRequestTable } from "@/features/fuel-requests/components/FuelRequestTable"

export const dynamic = "force-dynamic"

export default async function FuelRequestPage(props: { 
  searchParams: Promise<{ 
    search?: string;
    region?: string; 
    from?: string;
    to?: string;
    page?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    tab?: string;
  }> 
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.search;
  const region = searchParams.region;
  const from = searchParams.from;
  const to = searchParams.to;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const tab = searchParams.tab || "pending";
  const sortBy = searchParams.sortBy || 'createdAt';
  const sortOrder = searchParams.sortOrder || 'desc';
  const limit = 10;
  const skip = (page - 1) * limit;

  // Build dynamic where clause
  const whereBase: any = {};
  if (region) whereBase.site = { region };
  
  // Date filter
  if (from || to) {
    whereBase.createdAt = {};
    if (from) whereBase.createdAt.gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      whereBase.createdAt.lte = toDate;
    }
  }

  if (search) {
    whereBase.OR = [
      { site: { name: { contains: search, mode: 'insensitive' } } },
      { site: { siteId: { contains: search, mode: 'insensitive' } } },
      { workOrderNumber: { contains: search, mode: 'insensitive' } },
      { workRequestNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Build dynamic orderBy
  let orderBy: any = { [sortBy]: sortOrder };
  if (sortBy === 'siteName') {
    orderBy = { site: { name: sortOrder } };
  } else if (sortBy === 'siteId') {
    orderBy = { site: { siteId: sortOrder } };
  }

  // Fetch paginated data for main tabs
  const [
    pendingRequests, pendingTotal,
    adminRequests, adminTotal,
    approvedRequests, approvedTotal,
    deliveryRequests, deliveryTotal,
    closedRequests, closedTotal
  ] = await Promise.all([
    prisma.fuelRequest.findMany({
      orderBy,
      where: { status: { in: ['PENDING', 'PENDING_SUPERVISOR', 'PENDING_MANAGER'] }, ...whereBase },
      include: { site: true },
      skip, take: limit
    }),
    prisma.fuelRequest.count({ where: { status: { in: ['PENDING', 'PENDING_SUPERVISOR', 'PENDING_MANAGER'] }, ...whereBase } }),

    prisma.fuelRequest.findMany({
      orderBy,
      where: { status: 'PENDING_ADMIN', ...whereBase },
      include: { site: true },
      skip, take: limit
    }),
    prisma.fuelRequest.count({ where: { status: 'PENDING_ADMIN', ...whereBase } }),

    prisma.fuelRequest.findMany({
      orderBy,
      where: { status: 'APPROVED_FOR_FUEL', ...whereBase },
      include: { site: true },
      skip, take: limit
    }),
    prisma.fuelRequest.count({ where: { status: 'APPROVED_FOR_FUEL', ...whereBase } }),

    prisma.fuelRequest.findMany({
      orderBy,
      where: { status: 'FUNDS_RELEASED', ...whereBase },
      include: { site: true },
      skip, take: limit
    }),
    prisma.fuelRequest.count({ where: { status: 'FUNDS_RELEASED', ...whereBase } }),

    prisma.fuelRequest.findMany({
      orderBy,
      where: { status: 'COMPLETED', ...whereBase },
      include: { site: true },
      skip, take: limit
    }),
    prisma.fuelRequest.count({ where: { status: 'COMPLETED', ...whereBase } })
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-6 overflow-x-auto overflow-y-hidden">
        <div className="flex items-center justify-end mt-5">
          <FuelRequestHeader />
        </div>

        <Tabs defaultValue={tab} className="flex flex-1 flex-col mt-2">
          <TabsList className="bg-slate-100/50 p-1 w-full max-w-4xl grid grid-cols-6 rounded-lg">
            <TabsTrigger value="pending" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2 text-xs">
              Approvals ({pendingTotal})
            </TabsTrigger>
            <TabsTrigger value="admin" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2 text-xs">
              Admin ({adminTotal})
            </TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2 text-xs">
              Approved ({approvedTotal})
            </TabsTrigger>
            <TabsTrigger value="delivery" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2 text-xs">
              Delivery ({deliveryTotal})
            </TabsTrigger>
            <TabsTrigger value="closed" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2 text-xs">
              Closed ({closedTotal})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="flex-1 mt-6 m-0 border-0 p-0 focus-visible:ring-0">
            <FuelRequestTable 
              requests={pendingRequests} 
              title="Supervisor & Manager Approvals" 
              total={pendingTotal} 
              page={page} 
              totalPages={Math.ceil(pendingTotal/limit)} 
              region={region} 
              actionType='supervisor'
              sortBy={sortBy}
              sortOrder={sortOrder}
              dateFrom={from}
              dateTo={to}
            />
          </TabsContent>
          <TabsContent value="admin" className="flex-1 mt-6 m-0 border-0 p-0 focus-visible:ring-0">
            <FuelRequestTable 
              requests={adminRequests} 
              title="Awaiting Fuel Admin Work Order generation" 
              total={adminTotal} 
              page={page} 
              totalPages={Math.ceil(adminTotal/limit)} 
              region={region} 
              actionType='admin'
              sortBy={sortBy}
              sortOrder={sortOrder}
              dateFrom={from}
              dateTo={to}
            />
          </TabsContent>
          <TabsContent value="approved" className="flex-1 mt-6 m-0 border-0 p-0 focus-visible:ring-0">
            <FuelRequestTable 
              requests={approvedRequests} 
              title="Approved & Ready for Financial Voucher" 
              total={approvedTotal} 
              page={page} 
              totalPages={Math.ceil(approvedTotal/limit)} 
              region={region} 
              sortBy={sortBy}
              sortOrder={sortOrder}
              dateFrom={from}
              dateTo={to}
            />
          </TabsContent>
          <TabsContent value="delivery" className="flex-1 mt-6 m-0 border-0 p-0 focus-visible:ring-0">
            <FuelRequestTable 
              requests={deliveryRequests} 
              title="Funds Released - Ready for Delivery" 
              total={deliveryTotal} 
              page={page} 
              totalPages={Math.ceil(deliveryTotal/limit)} 
              region={region} 
              sortBy={sortBy}
              sortOrder={sortOrder}
              dateFrom={from}
              dateTo={to}
            />
          </TabsContent>
          <TabsContent value="closed" className="flex-1 mt-6 m-0 border-0 p-0 focus-visible:ring-0">
            <FuelRequestTable 
              requests={closedRequests} 
              title="Closed / Completed Work Orders" 
              total={closedTotal} 
              page={page} 
              totalPages={Math.ceil(closedTotal/limit)} 
              region={region} 
              sortBy={sortBy}
              sortOrder={sortOrder}
              dateFrom={from}
              dateTo={to}
            />
          </TabsContent>
        </Tabs>
    </div>
  )
}

