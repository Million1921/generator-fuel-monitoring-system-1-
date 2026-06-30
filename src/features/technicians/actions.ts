"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth"
import prisma from "@/lib/db"

export async function getTechnicians(
  region?: string, 
  page: number = 1, 
  limit: number = 5,
  sortBy: string = 'name',
  sortOrder: 'asc' | 'desc' = 'asc',
  search?: string
) {
  const skip = (page - 1) * limit
  const where: any = {
    AND: [
      region ? { region: { name: region } } : {},
      search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ]
      } : {}
    ]
  }

  const [technicians, total] = await Promise.all([
    prisma.technician.findMany({
      where,
      include: {
        user: true,
        region: true,
      },
      orderBy: sortBy === 'region' ? { region: { name: sortOrder } } : { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.technician.count({ where })
  ])

  return { technicians, total }
}

export async function createTechnician(data: {
  name: string
  department: string
  phone: string
  email: string
  regionId?: string
}) {
  await requireRole(["ADMIN", "MANAGER"])

  let finalRegionId: number | null = null;
  if (data.regionId) {
    const parsed = parseInt(data.regionId);
    if (!isNaN(parsed)) {
      finalRegionId = parsed;
    } else {
      const regionRecord = await prisma.region.findUnique({
        where: { name: data.regionId }
      });
      if (regionRecord) {
        finalRegionId = regionRecord.id;
      }
    }
  }

  const technician = await prisma.technician.create({
    data: {
      name: data.name,
      department: data.department,
      phone: data.phone,
      email: data.email,
      regionId: finalRegionId,
    }
  })
  revalidatePath("/dashboard/technicians")
  return technician
}

export async function updateTechnician(id: number, data: {
  name: string
  department: string
  phone: string
  email: string
  regionId?: string
}) {
  await requireRole(["ADMIN", "MANAGER"])

  let finalRegionId: number | null = null;
  if (data.regionId) {
    const parsed = parseInt(data.regionId);
    if (!isNaN(parsed)) {
      finalRegionId = parsed;
    } else {
      const regionRecord = await prisma.region.findUnique({
        where: { name: data.regionId }
      });
      if (regionRecord) {
        finalRegionId = regionRecord.id;
      }
    }
  }

  const technician = await prisma.technician.update({
    where: { id },
    data: {
      name: data.name,
      department: data.department,
      phone: data.phone,
      email: data.email,
      regionId: finalRegionId,
    }
  })
  revalidatePath("/dashboard/technicians")
  return technician
}

export async function deleteTechnician(id: number) {
  await requireRole(["ADMIN", "MANAGER"])

  await prisma.technician.delete({ where: { id } })
  revalidatePath("/dashboard/technicians")
}
