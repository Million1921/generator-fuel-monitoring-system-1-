export const dynamic = "force-dynamic";
import prisma from "@/lib/db"
import { authErrorResponse, requireRole } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

// GET /api/sites — list all sites (with optional region filter)
export async function GET(req: NextRequest) {
  try {
    const region = req.nextUrl.searchParams.get("region") ?? undefined
    const sites = await prisma.site.findMany({
      where: region ? { region } : undefined,
      include: { generator: true, regionModel: true },
      orderBy: { siteId: "asc" },
    })
    return NextResponse.json(sites)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/sites — create a new site
export async function POST(req: NextRequest) {
  try {
    await requireRole(["ADMIN", "MANAGER"])

    const body = await req.json()
    const site = await prisma.site.create({
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
    return NextResponse.json(site, { status: 201 })
  } catch (e: any) {
    const authError = authErrorResponse(e)
    if (authError) return authError

    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
