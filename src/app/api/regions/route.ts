export const dynamic = "force-dynamic";
import prisma from "@/lib/db"
import { authErrorResponse, requireRole } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

// GET /api/regions — list all regions
export async function GET() {
  try {
    const regions = await prisma.region.findMany({
      include: { sites: true, technicians: true },
      orderBy: { name: "asc" },
    })
    return NextResponse.json(regions)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/regions — add a new region
export async function POST(req: NextRequest) {
  try {
    await requireRole(["ADMIN", "MANAGER"])

    const body = await req.json()
    const region = await prisma.region.create({
      data: {
        name: body.name,
      },
    })
    return NextResponse.json(region, { status: 201 })
  } catch (e: any) {
    const authError = authErrorResponse(e)
    if (authError) return authError

    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
