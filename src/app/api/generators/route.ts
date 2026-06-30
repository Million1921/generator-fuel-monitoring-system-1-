export const dynamic = "force-dynamic";
import prisma from "@/lib/db"
import { authErrorResponse, requireRole } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

// GET /api/generators — list all generators (optional ?siteId=)
export async function GET(req: NextRequest) {
  try {
    const siteId = req.nextUrl.searchParams.get("siteId")
    const generators = await prisma.generator.findMany({
      where: siteId ? { siteId: parseInt(siteId) } : undefined,
      include: { site: true },
      orderBy: { genId: "asc" },
    })
    return NextResponse.json(generators)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/generators — create a generator
export async function POST(req: NextRequest) {
  try {
    await requireRole(["ADMIN", "MANAGER"])

    const body = await req.json()
    const count = await prisma.generator.count({ where: { siteId: parseInt(body.siteId) } })
    const genId = `GEN-${body.siteId}-${count + 1}`
    const generator = await prisma.generator.create({
      data: {
        genId,
        model: body.model ?? null,
        serialNumber: body.serialNumber ?? null,
        capacityKVA: body.capacityKVA ? parseFloat(body.capacityKVA) : 0,
        stdFuelConsumption: body.stdFuelConsumption ? parseFloat(body.stdFuelConsumption) : 0,
        lastRunningHours: body.lastRunningHours ? parseFloat(body.lastRunningHours) : 0,
        siteId: parseInt(body.siteId),
      },
    })
    return NextResponse.json(generator, { status: 201 })
  } catch (e: any) {
    const authError = authErrorResponse(e)
    if (authError) return authError

    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
