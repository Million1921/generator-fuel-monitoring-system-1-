export const dynamic = "force-dynamic";
import prisma from "@/lib/db"
import { authErrorResponse, requireRole } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

// GET /api/fuel-requests — list all (optional ?region=, ?status=)
export async function GET(req: NextRequest) {
  try {
    const region = req.nextUrl.searchParams.get("region") ?? undefined
    const status = req.nextUrl.searchParams.get("status") ?? undefined
    const requests = await prisma.fuelRequest.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(region ? { site: { region } } : {}),
      },
      include: { site: true, technician: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(requests)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/fuel-requests — create a new fuel request
export async function POST(req: NextRequest) {
  try {
    await requireRole(["ADMIN", "MANAGER", "SUPERVISOR", "TECHNICIAN"])

    const body = await req.json()
    const count = await prisma.fuelRequest.count()
    const workRequestNumber = `REQ-${1000 + count}`
    const request = await prisma.fuelRequest.create({
      data: {
        workRequestNumber,
        siteId: parseInt(body.siteId),
        status: body.status ?? "PENDING_SUPERVISOR",
        priority: body.priority ?? null,
        literRequired: body.literRequired ? parseFloat(body.literRequired) : null,
        technicianId: body.technicianId ? parseInt(body.technicianId) : null,
        notes: body.notes ?? null,
      },
    })
    return NextResponse.json(request, { status: 201 })
  } catch (e: any) {
    const authError = authErrorResponse(e)
    if (authError) return authError

    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
