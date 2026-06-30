export const dynamic = "force-dynamic";
import prisma from "@/lib/db"
import { authErrorResponse, requireRole } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

// GET /api/technicians — list all technicians (optional ?regionId=)
export async function GET(req: NextRequest) {
  try {
    const regionId = req.nextUrl.searchParams.get("regionId")
    
    const technicians = await prisma.technician.findMany({
      where: regionId ? { regionId: parseInt(regionId) } : undefined,
      include: { region: true, user: true },
      orderBy: { name: "asc" },
    })
    return NextResponse.json(technicians)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/technicians — add a new technician
export async function POST(req: NextRequest) {
  try {
    await requireRole(["ADMIN", "MANAGER"])

    const body = await req.json()
    const technician = await prisma.technician.create({
      data: {
        name: body.name,
        department: body.department ?? null,
        phone: body.phone ?? null,
        email: body.email ?? null,
        regionId: body.regionId ? parseInt(body.regionId) : null,
        userId: body.userId ?? null,
      },
    })
    return NextResponse.json(technician, { status: 201 })
  } catch (e: any) {
    const authError = authErrorResponse(e)
    if (authError) return authError

    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
