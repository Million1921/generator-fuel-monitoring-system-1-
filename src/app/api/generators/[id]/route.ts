export const dynamic = "force-dynamic";
import prisma from "@/lib/db"
import { authErrorResponse, requireRole } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

// GET /api/generators/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const generator = await prisma.generator.findUnique({
      where: { id: parseInt(id) },
      include: { site: true },
    })
    if (!generator) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(generator)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PUT /api/generators/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN", "MANAGER"])

    const { id } = await params;
    const body = await req.json()
    const generator = await prisma.generator.update({
      where: { id: parseInt(id) },
      data: {
        model: body.model ?? null,
        serialNumber: body.serialNumber ?? null,
        capacityKVA: body.capacityKVA ? parseFloat(body.capacityKVA) : undefined,
        stdFuelConsumption: body.stdFuelConsumption ? parseFloat(body.stdFuelConsumption) : undefined,
        lastRunningHours: body.lastRunningHours ? parseFloat(body.lastRunningHours) : undefined,
      },
    })
    return NextResponse.json(generator)
  } catch (e: any) {
    const authError = authErrorResponse(e)
    if (authError) return authError

    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/generators/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN", "MANAGER"])

    const { id } = await params;
    await prisma.generator.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    const authError = authErrorResponse(e)
    if (authError) return authError

    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
