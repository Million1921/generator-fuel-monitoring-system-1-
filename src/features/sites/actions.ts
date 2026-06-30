"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth"
import prisma from "@/lib/db"

export async function getSites(region?: string) {
  return await prisma.site.findMany({
    where: region ? { region } : undefined,
    orderBy: { siteId: 'asc' }
  })
}

export async function createSite(data: { siteId: string; name: string; region: string; tankerCapacity: string; dgCapacity?: string; dgType?: string; gpsCoordinates?: string; regionId?: string }) {
  await requireRole(["ADMIN", "MANAGER"])

  let actualRegionId = data.regionId ? parseInt(data.regionId) : undefined;
  
  if (!actualRegionId && data.region) {
    const regionRecord = await prisma.region.findUnique({
      where: { name: data.region }
    });
    if (regionRecord) {
      actualRegionId = regionRecord.id;
    }
  }

  const site = await prisma.site.create({
    data: {
      siteId: data.siteId,
      name: data.name,
      region: data.region,
      tankerCapacity: parseFloat(data.tankerCapacity),
      dgCapacity: data.dgCapacity,
      dgType: data.dgType,
      gpsCoordinates: data.gpsCoordinates,
      regionId: actualRegionId,
    }
  })
  revalidatePath("/dashboard/sites")
  return site
}

export async function updateSite(id: number, data: { siteId: string; name: string; region: string; tankerCapacity: string; dgCapacity?: string; dgType?: string; gpsCoordinates?: string; regionId?: string }) {
  await requireRole(["ADMIN", "MANAGER"])

  let actualRegionId = data.regionId ? parseInt(data.regionId) : undefined;
  
  if (!actualRegionId && data.region) {
    const regionRecord = await prisma.region.findUnique({
      where: { name: data.region }
    });
    if (regionRecord) {
      actualRegionId = regionRecord.id;
    }
  }

  const site = await prisma.site.update({
    where: { id },
    data: {
      siteId: data.siteId,
      name: data.name,
      region: data.region,
      tankerCapacity: parseFloat(data.tankerCapacity),
      dgCapacity: data.dgCapacity,
      dgType: data.dgType,
      gpsCoordinates: data.gpsCoordinates,
      regionId: actualRegionId,
    }
  })
  revalidatePath("/dashboard/sites")
  return site
}

export async function deleteSite(id: number) {
  await requireRole(["ADMIN", "MANAGER"])

  await prisma.site.delete({ where: { id } })
  revalidatePath("/dashboard/sites")
}
