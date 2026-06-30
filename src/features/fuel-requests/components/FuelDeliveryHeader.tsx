import { FuelDeliveryExportButtons } from "./FuelDeliveryExportButtons"
import { FuelDeliverySheet } from "./FuelDeliverySheet"

export function FuelDeliveryHeader({ deliveries }: { deliveries: any[] }) {
  return (
    <div className="flex items-center gap-3">
      <FuelDeliveryExportButtons deliveries={deliveries} />
      <FuelDeliverySheet />
    </div>
  )
}
