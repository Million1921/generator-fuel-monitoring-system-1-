/**
 * Application-wide configuration and constants.
 */
export const APP_CONFIG = {
  // Fuel unit price in Ethiopian Birr (ETB)
  FUEL_UNIT_PRICE: 76.5,
  
  // High consumption threshold: generators consuming more than this over average are flagged
  // (This can be more dynamic in the future)
  HIGH_CONSUMPTION_THRESHOLD_MULTIPLIER: 1.1,
} as const;
