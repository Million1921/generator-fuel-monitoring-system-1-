import prisma from "@/lib/db"
import { APP_CONFIG } from "@/lib/config"

export async function getAnalyticalReport(
  region?: string, 
  page: number = 1, 
  limit: number = 5,
  sortBy: string = 'siteNumber',
  sortOrder: 'asc' | 'desc' = 'asc'
) {
  const skip = (page - 1) * limit;
  const where = region ? { region } : {};

  let orderBy: any = { [sortBy]: sortOrder };
  if (sortBy === 'siteNumber') {
    orderBy = { siteId: sortOrder };
  } else if (sortBy === 'location') {
    orderBy = { name: sortOrder };
  }

  const [sites, total] = await Promise.all([
    prisma.site.findMany({
      where,
      include: {
        generator: true,
        fuelRequests: {
          where: {
            status: 'COMPLETED'
          }
        },
        fuelRefills: {
          orderBy: { refillDate: 'desc' },
        }
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.site.count({ where })
  ]);

  const data = sites.map(site => {
    const totalRefueled = site.fuelRequests.reduce((acc, req) => acc + (req.actualRefueled || 0), 0);
    
    let totalRunningHours = 0;
    if (site.fuelRefills.length > 0) {
      totalRunningHours = site.fuelRefills.reduce((acc, refill) => {
        const diff = (refill.afterHours || 0) - (refill.beforeHours || 0);
        return acc + (diff > 0 ? diff : 0);
      }, 0);
    }
    
    const amountInBirr = totalRefueled * APP_CONFIG.FUEL_UNIT_PRICE;
    
    const expectedConsumption = site.generator ? ((site.generator.stdFuelConsumption || 0) * totalRunningHours) : 0;
    const variance = totalRefueled - expectedConsumption;

    return {
      siteNumber: site.siteId,
      location: site.name,
      totalRefueled,
      totalRunningHours,
      amountInBirr,
      variance
    };
  });

  return { data, total };
}

export async function getFuelJournalData(
  region?: string, 
  page: number = 1, 
  limit: number = 5,
  sortBy: string = 'currRefuelDate',
  sortOrder: 'asc' | 'desc' = 'desc'
) {
  const skip = (page - 1) * limit;
  const where = region ? { site: { region } } : {};

  let orderBy: any = { [sortBy]: sortOrder };
  if (sortBy === 'currRefuelDate') {
    orderBy = { refillDate: sortOrder };
  } else if (sortBy === 'siteId') {
    orderBy = { site: { siteId: sortOrder } };
  } else if (sortBy === 'siteName') {
    orderBy = { site: { name: sortOrder } };
  }

  const [refills, total] = await Promise.all([
    prisma.fuelRefill.findMany({
      where,
      include: { 
        site: { 
          include: { 
            generator: true,
            fuelRefills: {
              orderBy: { refillDate: 'desc' }
            }
          } 
        },
        fuelRequest: true
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.fuelRefill.count({ where })
  ]);

  const data = refills.map((refill, i) => {
    const site = refill.site;
    const allRefills = site.fuelRefills;
    // Find the refill immediately before this one for this site
    const prevRefill = allRefills.find(r => r.refillDate < refill.refillDate);

    const currHr = refill.afterHours || 0;
    const prevHr = refill.beforeHours || 0;
    const runningHrs = currHr - prevHr;

    const actualRefueled = refill.fuelDelivered || 0;
    const unitPrice = refill.unitPrice || APP_CONFIG.FUEL_UNIT_PRICE;

    return {
      sn: skip + i + 1,
      employeeCreatedWO: refill.technicianName || "System",
      employeeIdWOCreate: refill.technicianIdStr || "SYS-001",
      workOrderNumber: refill.workOrderNumber || refill.fuelRequest?.workOrderNumber || "N/A",
      siteId: site.siteId,
      siteName: site.name,
      region: site.region || "-",
      tankerCapacity: site.tankerCapacity || 0,
      standard: site.generator?.stdFuelConsumption || 0,
      prevRefuelDate: prevRefill ? prevRefill.refillDate.toLocaleDateString() : "-",
      prevRefuelLiters: prevRefill ? prevRefill.fuelDelivered : 0,
      prevRefuelBirr: prevRefill ? prevRefill.fuelDelivered * unitPrice : 0,
      prevRefuelRunningHour: prevHr,
      currRefuelDate: refill.refillDate.toLocaleDateString(),
      currRefuelLiters: actualRefueled,
      currRefuelBirr: actualRefueled * unitPrice,
      currRefuelRunningHour: currHr,
      runningHourDifference: runningHrs,
      runningHrPerLit: actualRefueled > 0 ? (runningHrs / actualRefueled) : 0,
      maintOpSeq: "-",
      deviation: (actualRefueled - (site.generator?.stdFuelConsumption || 0) * runningHrs),
      unitPrice: unitPrice,
      remark: "",
    }
  });

  return { data, total };
}

export async function getFuelJournalExportData(
  region?: string,
  sortBy: string = 'currRefuelDate',
  sortOrder: 'asc' | 'desc' = 'desc'
) {
  const where = region ? { site: { region } } : {};

  let orderBy: any = { [sortBy]: sortOrder };
  if (sortBy === 'currRefuelDate') {
    orderBy = { refillDate: sortOrder };
  } else if (sortBy === 'siteId') {
    orderBy = { site: { siteId: sortOrder } };
  } else if (sortBy === 'siteName') {
    orderBy = { site: { name: sortOrder } };
  }

  const refills = await prisma.fuelRefill.findMany({
    where,
    include: { 
      site: { 
        include: { 
          generator: true,
          fuelRefills: {
            orderBy: { refillDate: 'desc' }
          }
        } 
      },
      fuelRequest: true
    },
    orderBy,
  });

  const data = refills.map((refill, i) => {
    const site = refill.site;
    const allRefills = site.fuelRefills;
    const prevRefill = allRefills.find(r => r.refillDate < refill.refillDate);

    const currHr = refill.afterHours || 0;
    const prevHr = refill.beforeHours || 0;
    const runningHrs = currHr - prevHr;

    const actualRefueled = refill.fuelDelivered || 0;
    const unitPrice = refill.unitPrice || APP_CONFIG.FUEL_UNIT_PRICE;

    return {
      sn: i + 1,
      employeeCreatedWO: refill.technicianName || "System",
      employeeIdWOCreate: refill.technicianIdStr || "SYS-001",
      workOrderNumber: refill.workOrderNumber || refill.fuelRequest?.workOrderNumber || "N/A",
      siteId: site.siteId,
      siteName: site.name,
      region: site.region || "-",
      tankerCapacity: site.tankerCapacity || 0,
      standard: site.generator?.stdFuelConsumption || 0,
      prevRefuelDate: prevRefill ? prevRefill.refillDate.toLocaleDateString() : "-",
      prevRefuelLiters: prevRefill ? prevRefill.fuelDelivered : 0,
      prevRefuelBirr: prevRefill ? prevRefill.fuelDelivered * unitPrice : 0,
      prevRefuelRunningHour: prevHr,
      currRefuelDate: refill.refillDate.toLocaleDateString(),
      currRefuelLiters: actualRefueled,
      currRefuelBirr: actualRefueled * unitPrice,
      currRefuelRunningHour: currHr,
      runningHourDifference: runningHrs,
      runningHrPerLit: actualRefueled > 0 ? (runningHrs / actualRefueled) : 0,
      maintOpSeq: "-",
      deviation: (actualRefueled - (site.generator?.stdFuelConsumption || 0) * runningHrs),
      unitPrice: unitPrice,
      remark: "",
    }
  });

  return data;
}
