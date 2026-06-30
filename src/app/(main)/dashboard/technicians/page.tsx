import { getTechnicians } from "@/features/technicians/actions"
import { getRegions } from "@/features/regions/actions"
import { Users } from "lucide-react"
import { AddTechnicianSheet } from "@/features/technicians/components/AddTechnicianSheet"
import { TechnicianTable } from "@/features/technicians/components/TechnicianTable"

export const dynamic = "force-dynamic"

export default async function TechniciansPage(props: { 
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
  const sortBy = searchParams.sortBy || 'name';
  const sortOrder = searchParams.sortOrder || 'asc';
  const limit = 10;

  const { technicians, total } = await getTechnicians(region, page, limit, sortBy, sortOrder)
  const regions = await getRegions()
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex flex-1 flex-col gap-2 px-6 pb-6 overflow-x-auto overflow-y-hidden">
        <div className="flex items-center justify-end mt-5">
          <AddTechnicianSheet regions={regions} />
        </div>

        <TechnicianTable 
          technicians={technicians}
          total={total}
          page={page}
          totalPages={totalPages}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
    </div>
  )
}
