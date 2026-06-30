import prisma from "@/lib/db"

export async function getAllSites() {
  return await prisma.site.findMany({
    orderBy: { siteId: 'asc' },
    select: { id: true, siteId: true, name: true }
  })
}

export async function getSites(
  region?: string, 
  search?: string, 
  page: number = 1, 
  limit: number = 5,
  sortBy: string = 'siteId',
  sortOrder: 'asc' | 'desc' = 'asc'
) {
  const skip = (page - 1) * limit

  const where = {
    AND: [
      region ? { region } : {},
      search ? {
        OR: [
          { siteId: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ]
      } : {}
    ]
  } as any

  const [sites, total] = await Promise.all([
    prisma.site.findMany({
      where,
      include: {
        generator: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.site.count({ where })
  ])

  return { sites, total }
}
