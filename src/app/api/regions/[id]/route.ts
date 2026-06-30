export const dynamic = "force-dynamic";
import prisma from "@/lib/db"
import { authErrorResponse, requireRole } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

// GET /api/regions/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const region = await prisma.region.findUnique({
      where: { id: parseInt(id) },
      include: { sites: true, technicians: true },
    })
    if (!region) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(region)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PUT /api/regions/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN", "MANAGER"])

    const { id } = await params;
    const body = await req.json()
    const region = await prisma.region.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name ?? undefined,
      },
    })
    return NextResponse.json(region)
  } catch (e: any) {
    const authError = authErrorResponse(e)
    if (authError) return authError

    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/regions/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN", "MANAGER"])

    const { id } = await params;
    await prisma.region.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    const authError = authErrorResponse(e)
    if (authError) return authError

    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
