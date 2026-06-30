import { getFuelRefills } from "@/features/fuel-refills/actions"
import { FuelUsageTable } from "@/features/fuel-refills/components/FuelUsageTable"

export const dynamic = "force-dynamic"

export default async function FuelUsageHistoryPage(props: { 
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
  const sortBy = searchParams.sortBy || 'refillDate';
  const sortOrder = searchParams.sortOrder || 'desc';
  const limit = 10;
  
  const { data: refills, total } = await getFuelRefills(region, page, limit, sortBy, sortOrder);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-6 bg-gray-50/30 overflow-x-auto overflow-y-hidden">
      <div className="flex flex-1 flex-col pt-5">
        <FuelUsageTable 
          refills={refills}
          total={total}
          page={page}
          totalPages={totalPages}
        />
      </div>
    </div>
  )
}

