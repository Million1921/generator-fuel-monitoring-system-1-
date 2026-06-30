"use server"

import prisma from "@/lib/db"

export async function getRegions() {
  return await prisma.region.findMany({
    orderBy: { name: 'asc' }
  })
}
