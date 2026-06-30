export const dynamic = "force-dynamic";
import prisma from "@/lib/db"
import { authErrorResponse, requireRole } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

// GET /api/technicians/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const technician = await prisma.technician.findUnique({
      where: { id: parseInt(id) },
      include: { region: true, user: true, fuelRequests: true, fuelRefills: true },
    })
    if (!technician) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(technician)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PUT /api/technicians/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN", "MANAGER"])

    const { id } = await params;
    const body = await req.json()
    const technician = await prisma.technician.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name ?? undefined,
        department: body.department ?? undefined,
        phone: body.phone ?? undefined,
        email: body.email ?? undefined,
        regionId: body.regionId ? parseInt(body.regionId) : undefined,
        userId: body.userId ?? undefined,
      },
    })
    return NextResponse.json(technician)
  } catch (e: any) {
    const authError = authErrorResponse(e)
    if (authError) return authError

    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/technicians/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN", "MANAGER"])

    const { id } = await params;
    await prisma.technician.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    const authError = authErrorResponse(e)
    if (authError) return authError

    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
