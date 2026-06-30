export const dynamic = "force-dynamic";
import prisma from "@/lib/db"
import { authErrorResponse, requireRole } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

// GET /api/fuel-requests/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const request = await prisma.fuelRequest.findUnique({
      where: { id: parseInt(id) },
      include: { site: true, technician: true },
    })
    if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(request)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PUT /api/fuel-requests/[id] — general update (status, approval, etc.)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN", "MANAGER", "SUPERVISOR"])

    const { id: paramId } = await params;
    const body = await req.json()
    const id = parseInt(paramId)
    let extra: Record<string, any> = {}

    // Auto-generate work order number when moving to APPROVED_FOR_FUEL
    if (body.status === "APPROVED_FOR_FUEL" && !body.workOrderNumber) {
      const woCount = await prisma.fuelRequest.count({ where: { workOrderNumber: { not: null } } })
      extra.workOrderNumber = `WO-${1000 + woCount}`
    }

    const updated = await prisma.fuelRequest.update({
      where: { id },
      data: {
        status: body.status ?? undefined,
        priority: body.priority ?? undefined,
        actualRefueled: body.actualRefueled ? parseFloat(body.actualRefueled) : undefined,
        technicianId: body.technicianId ? parseInt(body.technicianId) : undefined,
        notes: body.notes ?? undefined,
        rejectionReason: body.rejectionReason ?? undefined,
        approvedAt: body.status?.startsWith("APPROVED") ? new Date() : undefined,
        rejectedAt: body.status === "REJECTED" ? new Date() : undefined,
        ...extra,
      },
    })
    return NextResponse.json(updated)
  } catch (e: any) {
    const authError = authErrorResponse(e)
    if (authError) return authError

    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/fuel-requests/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN", "MANAGER"])

    const { id } = await params;
    await prisma.fuelRequest.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    const authError = authErrorResponse(e)
    if (authError) return authError

    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
