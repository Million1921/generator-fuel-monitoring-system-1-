export const dynamic = "force-dynamic";
import prisma from "@/lib/db"
import { authErrorResponse, requireRole } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

// GET /api/fuel-refills — list all refills (optional ?siteId=, ?technicianId=)
export async function GET(req: NextRequest) {
  try {
    const siteId = req.nextUrl.searchParams.get("siteId")
    const technicianId = req.nextUrl.searchParams.get("technicianId")
    
    const refills = await prisma.fuelRefill.findMany({
      where: {
        ...(siteId ? { siteId: parseInt(siteId) } : {}),
        ...(technicianId ? { technicianId: parseInt(technicianId) } : {}),
      },
      include: { site: true, technician: true },
      orderBy: { refillDate: "desc" },
    })
    return NextResponse.json(refills)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/fuel-refills — record a new refill and update generator's lastRunningHours
export async function POST(req: NextRequest) {
  try {
    await requireRole(["ADMIN", "MANAGER", "SUPERVISOR", "TECHNICIAN"])

    const body = await req.json()
    
    // 1. Create the refill record
    const refill = await prisma.fuelRefill.create({
      data: {
        fuelDelivered: parseFloat(body.fuelDelivered),
        beforeLevel: parseFloat(body.beforeLevel),
        afterLevel: parseFloat(body.afterLevel),
        beforeHours: parseFloat(body.beforeHours),
        afterHours: parseFloat(body.afterHours),
        refillDate: body.refillDate ? new Date(body.refillDate) : new Date(),
        siteId: parseInt(body.siteId),
        technicianId: body.technicianId ? parseInt(body.technicianId) : null,
        tankerVehicle: body.tankerVehicle ?? null,
        driverName: body.driverName ?? null,
      },
    })
    
    // 2. Update the generator's last running hours for that site
    await prisma.generator.update({
      where: { siteId: parseInt(body.siteId) },
      data: { lastRunningHours: parseFloat(body.afterHours) },
    })
    
    return NextResponse.json(refill, { status: 201 })
  } catch (e: any) {
    const authError = authErrorResponse(e)
    if (authError) return authError

    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
