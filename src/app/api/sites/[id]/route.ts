export const dynamic = "force-dynamic";
import prisma from "@/lib/db"
import { authErrorResponse, requireRole } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

// GET /api/sites/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const site = await prisma.site.findUnique({
      where: { id: parseInt(id) },
      include: { generator: true, regionModel: true, fuelRequests: true, fuelRefills: true },
    })
    if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(site)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PUT /api/sites/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN", "MANAGER"])

    const { id } = await params;
    const body = await req.json()
    const site = await prisma.site.update({
      where: { id: parseInt(id) },
      data: {
        siteId: body.siteId,
        name: body.name,
        region: body.region ?? null,
        tankerCapacity: body.tankerCapacity ? parseFloat(body.tankerCapacity) : null,
        dgCapacity: body.dgCapacity ?? null,
        dgType: body.dgType ?? null,
        gpsCoordinates: body.gpsCoordinates ?? null,
        regionId: body.regionId ? parseInt(body.regionId) : null,
      },
    })
    return NextResponse.json(site)
  } catch (e: any) {
    const authError = authErrorResponse(e)
    if (authError) return authError

    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/sites/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN", "MANAGER"])

    const { id } = await params;
    await prisma.site.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    const authError = authErrorResponse(e)
    if (authError) return authError

    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
