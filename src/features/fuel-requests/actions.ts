"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth"
import prisma from "@/lib/db"

export async function getPendingRequests(region?: string) {
  return await prisma.fuelRequest.findMany({
    where: {
      status: { in: ['PENDING_SUPERVISOR', 'PENDING'] },
      ...(region ? { site: { region } } : {})
    },
    include: {
      site: {
        include: {
          generator: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getDeliverySites(region?: string) {
  return await prisma.site.findMany({
    where: region ? { region } : {},
    include: { generator: true },
    orderBy: { name: 'asc' }
  })
}

export async function getApprovedRequests(siteId?: number) {
  return await prisma.fuelRequest.findMany({
    where: {
      status: "APPROVED_FOR_FUEL",
      ...(siteId ? { siteId } : {})
    },
    include: { site: true },
    orderBy: { createdAt: 'desc' }
  })
}

export interface FuelDeliveryData {
  siteId: string;
  actualRefueled: number;
  begRunningHour: number;
  endRunningHour: number;
  fuelBeforeRefuel: number;
  unitPrice: number;
  driverName?: string;
  driverId?: string;
  technicianName?: string;
  technicianId?: string;
  employmentType?: string;
  requestId?: string;
  workOrderNumber?: string;
}

export async function createFuelDelivery(data: FuelDeliveryData) {
  await requireRole(["ADMIN", "MANAGER", "SUPERVISOR", "TECHNICIAN"])

  try {
    const siteId = parseInt(data.siteId);

  // 1. Create a FuelRefill record
  const refill = await prisma.fuelRefill.create({
    data: {
      siteId: siteId,
      fuelDelivered: data.actualRefueled,
      beforeLevel: data.fuelBeforeRefuel,
      afterLevel: data.fuelBeforeRefuel + data.actualRefueled,
      beforeHours: data.begRunningHour,
      afterHours: data.endRunningHour,
      driverName: data.driverName,
      driverId: data.driverId,
      technicianName: data.technicianName,
      technicianIdStr: data.technicianId,
      employmentType: data.employmentType,
      fuelRequestId: data.requestId ? parseInt(data.requestId) : null,
      workOrderNumber: data.workOrderNumber,
      unitPrice: data.unitPrice,
    } as any
  });

  // 2. Update Generator current hours
  const generator = await prisma.generator.findUnique({ where: { siteId: siteId } });
  if (generator) {
    await prisma.generator.update({
      where: { siteId: siteId },
      data: { lastRunningHours: data.endRunningHour }
    });
  }

  // 3. Update FuelRequest if requestId is provided
  if (data.requestId) {
    await prisma.fuelRequest.update({
      where: { id: parseInt(data.requestId) },
      data: { 
        status: "COMPLETED",
        actualRefueled: data.actualRefueled
      }
    });
  }

  revalidatePath("/dashboard/fuel-delivery")
  revalidatePath("/dashboard/fuel-journal")
  revalidatePath("/dashboard/analytical-report")
  revalidatePath("/dashboard/fuel-request")
  revalidatePath("/dashboard")
  revalidatePath("/")
  
  return refill;
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

export interface FuelRequestData {
  siteId: string;
  priority?: string;
  literRequired?: number | string;
  technicianId?: string;
  remark?: string;
}

export async function createFuelRequest(data: FuelRequestData) {
  await requireRole(["ADMIN", "MANAGER", "SUPERVISOR", "TECHNICIAN"])

  const count = await prisma.fuelRequest.count()
  const workRequestNumber = `REQ-${1000 + count}`

  const literStr = data.literRequired ? String(data.literRequired).trim() : "";
  const parsedLiter = literStr ? parseFloat(literStr) : null;

  const request = await prisma.fuelRequest.create({
    data: {
      workRequestNumber,
      siteId: parseInt(data.siteId),
      status: "PENDING_SUPERVISOR",
      priority: data.priority || "ROUTINE",
      literRequired: (parsedLiter !== null && !isNaN(parsedLiter)) ? parsedLiter : null,
      technicianId: data.technicianId ? parseInt(data.technicianId) : null,
      notes: data.remark || null,
    }
  })
  revalidatePath("/dashboard/fuel-request")
  revalidatePath("/dashboard")
  revalidatePath("/")
  return request
}

export async function approveToManager(id: number) {
  await requireRole(["ADMIN", "SUPERVISOR"])

  await prisma.fuelRequest.update({
    where: { id },
    data: { status: "PENDING_MANAGER" }
  })
  revalidatePath("/dashboard/fuel-request")
  revalidatePath("/dashboard")
}

export async function approveToAdmin(id: number) {
  await requireRole(["ADMIN", "MANAGER"])

  await prisma.fuelRequest.update({
    where: { id },
    data: { status: "PENDING_ADMIN" }
  })
  revalidatePath("/dashboard/fuel-request")
  revalidatePath("/dashboard")
}

export async function createWorkOrder(id: number) {
  await requireRole(["ADMIN", "MANAGER"])

  const woCount = await prisma.fuelRequest.count({ where: { workOrderNumber: { not: null } } })
  const workOrderNumber = `WO-${1000 + woCount}`

  await prisma.fuelRequest.update({
    where: { id },
    data: { status: "APPROVED_FOR_FUEL", workOrderNumber }
  })
  revalidatePath("/dashboard/fuel-request")
  revalidatePath("/dashboard")
}

export async function deleteFuelRequest(id: number) {
  await requireRole(["ADMIN", "MANAGER"])

  await prisma.fuelRequest.delete({
    where: { id }
  })
  revalidatePath("/dashboard/fuel-request")
  revalidatePath("/dashboard")
}

export async function deleteFuelDelivery(id: number) {
  await requireRole(["ADMIN", "MANAGER"])

  await prisma.fuelRefill.delete({
    where: { id }
  })
  revalidatePath("/dashboard/fuel-delivery")
  revalidatePath("/dashboard/fuel-journal")
  revalidatePath("/dashboard/analytical-report")
  revalidatePath("/dashboard")
  revalidatePath("/")
}

export async function updateFuelDelivery(id: number, data: Partial<FuelDeliveryData>) {
  await requireRole(["ADMIN", "MANAGER", "SUPERVISOR"])

  await prisma.fuelRefill.update({
    where: { id },
    data: {
      ...(data.actualRefueled !== undefined && { fuelDelivered: data.actualRefueled }),
      ...(data.fuelBeforeRefuel !== undefined && { beforeLevel: data.fuelBeforeRefuel }),
      ...(data.actualRefueled !== undefined && data.fuelBeforeRefuel !== undefined && { afterLevel: data.fuelBeforeRefuel + data.actualRefueled }),
      ...(data.begRunningHour !== undefined && { beforeHours: data.begRunningHour }),
      ...(data.endRunningHour !== undefined && { afterHours: data.endRunningHour }),
      ...(data.driverName !== undefined && { driverName: data.driverName }),
      ...(data.driverId !== undefined && { driverId: data.driverId }),
      ...(data.technicianName !== undefined && { technicianName: data.technicianName }),
      ...(data.technicianId !== undefined && { technicianIdStr: data.technicianId }),
      ...(data.employmentType !== undefined && { employmentType: data.employmentType }),
      ...(data.requestId !== undefined && { fuelRequestId: data.requestId ? parseInt(data.requestId) : null }),
      ...(data.workOrderNumber !== undefined && { workOrderNumber: data.workOrderNumber }),
      ...(data.unitPrice !== undefined && { unitPrice: data.unitPrice }),
    } as any
  });

  if (data.siteId && data.endRunningHour !== undefined) {
    const generator = await prisma.generator.findUnique({ where: { siteId: parseInt(data.siteId) } });
    if (generator) {
      await prisma.generator.update({
        where: { siteId: parseInt(data.siteId) },
        data: { lastRunningHours: data.endRunningHour }
      });
    }
  }

  revalidatePath("/dashboard/fuel-delivery")
  revalidatePath("/dashboard/fuel-journal")
  revalidatePath("/dashboard/analytical-report")
  revalidatePath("/dashboard")
}
