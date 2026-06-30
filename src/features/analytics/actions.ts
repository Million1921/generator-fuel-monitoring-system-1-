"use server"

import { getFuelJournalExportData } from "./queries"

export async function exportFuelJournalAction(region?: string, sortBy?: string, sortOrder?: 'asc' | 'desc') {
  return await getFuelJournalExportData(region, sortBy, sortOrder);
}
