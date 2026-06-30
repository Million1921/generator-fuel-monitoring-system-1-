export const ADDIS_ABABA_REGIONS = [
  "CNR", "NER", "NAAR", "EAAR", "WAAR", "SAAR", "SWAAR"
] as const;

export const OUTSIDE_ADDIS_REGIONS = [
  "SWWR", "SWR", "EER", "WWR", "NEER", "NWR", "WR", "NR", 
  "CER", "SSWR", "ER", "CWR", "SR", "SER", "NNWR", "SSER"
] as const;

export const ALL_REGIONS = [
  ...ADDIS_ABABA_REGIONS,
  ...OUTSIDE_ADDIS_REGIONS
] as const;

export type RegionType = typeof ALL_REGIONS[number];
