"use server"

import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function deleteTransaction(id: number) {
  await requireRole(["ADMIN", "MANAGER", "FINANCE"])

  try {
    await prisma.transaction.delete({
      where: { id }
    });
    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    throw new Error(`Failed to delete transaction: ${error.message}`);
  }
}

export async function updateTransaction(id: number, data: any) {
  await requireRole(["ADMIN", "MANAGER", "FINANCE"])

  try {
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        receiptNo: data.receiptNo !== undefined ? data.receiptNo : undefined,
        senderAccount: data.senderAccount !== undefined ? data.senderAccount : undefined,
        receiverAccount: data.receiverAccount !== undefined ? data.receiverAccount : undefined,
        paidAmount: data.paidAmount !== undefined ? parseFloat(data.paidAmount) : undefined,
        senderAmount: data.senderAmount !== undefined ? parseFloat(data.senderAmount) : undefined,
        payerName: data.payerName !== undefined ? data.payerName : undefined,
        location: data.location !== undefined ? data.location : undefined,
        fuelStation: data.fuelStation !== undefined ? data.fuelStation : undefined,
        fuelType: data.fuelType !== undefined ? data.fuelType : undefined,
        type: data.type !== undefined ? data.type : undefined,
        remark: data.remark !== undefined ? data.remark : undefined,
      }
    });
    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error: any) {
    throw new Error(`Failed to update transaction: ${error.message}`);
  }
}
export async function getTransactions() {
  return await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    include: { site: true }
  });
}
