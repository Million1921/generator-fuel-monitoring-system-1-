"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth"
import prisma from "@/lib/db"

export async function createFuelRefill(data: {
  siteId: number;
  fuelDelivered: number;
  beforeLevel: number;
  afterLevel: number;
  beforeHours: number;
  afterHours: number;
  tankerVehicle?: string;
  driverName?: string;
  technicianId?: number;
}) {
  await requireRole(["ADMIN", "MANAGER", "SUPERVISOR", "TECHNICIAN"])

  const refill = await prisma.fuelRefill.create({
    data: {
      siteId: data.siteId,
      fuelDelivered: data.fuelDelivered,
      beforeLevel: data.beforeLevel,
      afterLevel: data.afterLevel,
      beforeHours: data.beforeHours,
      afterHours: data.afterHours,
      tankerVehicle: data.tankerVehicle,
      driverName: data.driverName,
      technicianId: data.technicianId,
    }
  });

  const generator = await prisma.generator.findUnique({ where: { siteId: data.siteId } });
  if (generator) {
    await prisma.generator.update({
      where: { siteId: data.siteId },
      data: { lastRunningHours: data.afterHours }
    });
  }

  revalidatePath("/dashboard/fuel-journal");
  revalidatePath("/dashboard/analytical-report");
  revalidatePath("/dashboard/fuel-refill");
  revalidatePath("/dashboard");
  revalidatePath("/");
  
  return refill;
}

export async function getFuelRefills(
  region?: string,
  page: number = 1,
  limit: number = 10,
  sortBy: string = 'refillDate',
  sortOrder: 'asc' | 'desc' = 'desc'
) {
  const skip = (page - 1) * limit;
  const where = region ? { site: { region } } : undefined;

  let orderBy: any = { [sortBy]: sortOrder };
  if (sortBy === 'siteId' || sortBy === 'siteName') {
    orderBy = { site: { [sortBy === 'siteId' ? 'siteId' : 'name']: sortOrder } };
  }

  const [data, total] = await Promise.all([
    prisma.fuelRefill.findMany({
      where,
      include: {
        site: true,
        technician: true,
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.fuelRefill.count({ where })
  ]);

  return { data, total };
}
