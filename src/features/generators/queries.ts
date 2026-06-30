import prisma from "@/lib/db"

export async function getGenerators(
  region?: string, 
  page: number = 1, 
  limit: number = 5,
  sortBy: string = 'genId',
  sortOrder: 'asc' | 'desc' = 'asc'
) {
  const skip = (page - 1) * limit
  
  // Map UI sort keys to Prisma fields if necessary
  let orderBy: any = { [sortBy]: sortOrder };
  if (sortBy === 'siteName') {
    orderBy = { site: { name: sortOrder } };
  } else if (sortBy === 'siteId') {
     orderBy = { site: { siteId: sortOrder } };
  }

  const [generators, total, allGenerators] = await Promise.all([
    prisma.generator.findMany({
      where: region ? { site: { region } } : undefined,
      include: {
        site: true,
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.generator.count({
      where: region ? { site: { region } } : undefined,
    }),
    // Fetch all for summary stats (small enough dataset for now)
    prisma.generator.findMany({
      where: region ? { site: { region } } : undefined,
      select: { stdFuelConsumption: true }
    })
  ])

  // Calculate summary stats from ALL generators
  const withConsumption = allGenerators.filter((g: any) => g.stdFuelConsumption && g.stdFuelConsumption > 0)
  const avgConsumption = withConsumption.length > 0
    ? withConsumption.reduce((s: number, g: any) => s + (g.stdFuelConsumption ?? 0), 0) / withConsumption.length
    : 0

  const highCount = allGenerators.filter((g: any) => (g.stdFuelConsumption ?? 0) > avgConsumption * 1.2).length
  const normalCount = allGenerators.filter((g: any) => {
    const c = g.stdFuelConsumption ?? 0
    return c > 0 && c <= avgConsumption * 1.2
  }).length
  const idleCount = allGenerators.filter((g: any) => !g.stdFuelConsumption || g.stdFuelConsumption === 0).length

  return { 
    generators, 
    total,
    stats: {
      avgConsumption,
      highCount,
      normalCount,
      idleCount
    }
  }
}
