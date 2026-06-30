"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth"
import prisma from "@/lib/db"

export async function createGenerator(data: {
  model: string
  serialNumber: string
  capacityKVA: string
  stdFuelConsumption: string
  lastRunningHours: string
  siteId: string
}) {
  await requireRole(["ADMIN", "MANAGER"])

  const count = await prisma.generator.count({ where: { siteId: parseInt(data.siteId) } })
  const genId = `GEN-${data.siteId}-${count + 1}`

  const generator = await prisma.generator.create({
    data: {
      genId,
      model: data.model,
      serialNumber: data.serialNumber,
      capacityKVA: parseFloat(data.capacityKVA),
      stdFuelConsumption: parseFloat(data.stdFuelConsumption),
      lastRunningHours: parseFloat(data.lastRunningHours),
      siteId: parseInt(data.siteId),
    }
  })
  revalidatePath("/dashboard/generators")
  return generator
}

export async function updateGenerator(id: number, data: {
  model?: string
  serialNumber?: string
  capacityKVA?: string
  stdFuelConsumption?: string
  lastRunningHours?: string
}) {
  await requireRole(["ADMIN", "MANAGER"])

  const generator = await prisma.generator.update({
    where: { id },
    data: {
      model: data.model,
      serialNumber: data.serialNumber,
      capacityKVA: data.capacityKVA ? parseFloat(data.capacityKVA) : undefined,
      stdFuelConsumption: data.stdFuelConsumption ? parseFloat(data.stdFuelConsumption) : undefined,
      lastRunningHours: data.lastRunningHours ? parseFloat(data.lastRunningHours) : undefined,
    }
  })
  revalidatePath("/dashboard/generators")
  return generator
}

export async function deleteGenerator(id: number) {
  await requireRole(["ADMIN", "MANAGER"])

  await prisma.generator.delete({ where: { id } })
  revalidatePath("/dashboard/generators")
  return { success: true }
}
