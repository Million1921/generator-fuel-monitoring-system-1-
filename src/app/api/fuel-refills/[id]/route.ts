export const dynamic = "force-dynamic";
import prisma from "@/lib/db"
import { authErrorResponse, requireRole } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"


// GET /api/fuel-refills/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const refill = await prisma.fuelRefill.findUnique({
      where: { id: parseInt(id) },
      include: { site: true, technician: true },
    })
    if (!refill) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(refill)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PUT /api/fuel-refills/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN", "MANAGER", "SUPERVISOR"])

    const { id } = await params;
    const body = await req.json()
    const refill = await prisma.fuelRefill.update({
      where: { id: parseInt(id) },
      data: {
        fuelDelivered: body.fuelDelivered ? parseFloat(body.fuelDelivered) : undefined,
        beforeLevel: body.beforeLevel ? parseFloat(body.beforeLevel) : undefined,
        afterLevel: body.afterLevel ? parseFloat(body.afterLevel) : undefined,
        beforeHours: body.beforeHours ? parseFloat(body.beforeHours) : undefined,
        afterHours: body.afterHours ? parseFloat(body.afterHours) : undefined,
        refillDate: body.refillDate ? new Date(body.refillDate) : undefined,
        siteId: body.siteId ? parseInt(body.siteId) : undefined,
        technicianId: body.technicianId ? parseInt(body.technicianId) : undefined,
        tankerVehicle: body.tankerVehicle ?? undefined,
        driverName: body.driverName ?? undefined,
      },
    })
    
    // If afterHours was updated, we should also update the generator (optional but keeps consistency)
    if (body.afterHours) {
        await prisma.generator.update({
          where: { siteId: refill.siteId },
          data: { lastRunningHours: parseFloat(body.afterHours) },
        })
    }
    
    return NextResponse.json(refill)
  } catch (e: any) {
    const authError = authErrorResponse(e)
    if (authError) return authError

    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/fuel-refills/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN", "MANAGER"])

    const { id } = await params;
    await prisma.fuelRefill.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    const authError = authErrorResponse(e)
    if (authError) return authError

    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
