import { FuelDeliveryHeader } from "@/features/fuel-requests/components/FuelDeliveryHeader"
import prisma from "@/lib/db"
import { FuelDeliveryTable } from "@/features/fuel-requests/components/FuelDeliveryTable"

export const dynamic = "force-dynamic"

export default async function FuelDeliveryPage(props: { 
  searchParams: Promise<{ 
    search?: string; 
    page?: string;
    from?: string;
    to?: string;
  }> 
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.search;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const from = searchParams.from;
  const to = searchParams.to;
  
  const limit = 10;
  const skip = (page - 1) * limit;

  // Build Prisma Where Clause
  let where: any = {};
  
  if (search) {
    where.OR = [
      { site: { name: { contains: search, mode: 'insensitive' } } },
      { site: { siteId: { contains: search, mode: 'insensitive' } } },
      { driverName: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (from || to) {
    where.refillDate = {};
    if (from) where.refillDate.gte = new Date(from);
    if (to) where.refillDate.lte = new Date(to);
  }

  const [deliveries, total] = await Promise.all([
    prisma.fuelRefill.findMany({
      orderBy: { refillDate: 'desc' },
      where,
      include: { site: true, technician: true },
      skip,
      take: limit,
    }),
    prisma.fuelRefill.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-6 bg-gray-50/30 overflow-x-auto overflow-y-hidden">
        <div className="flex items-center justify-end mt-5">
          <FuelDeliveryHeader deliveries={deliveries} />
        </div>

        <FuelDeliveryTable 
          deliveries={deliveries}
          total={total}
          page={page}
          totalPages={totalPages}
          search={search}
          dateFrom={from}
          dateTo={to}
        />
    </div>
  )
}


