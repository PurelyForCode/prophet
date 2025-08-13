import { ValueException } from "../../../../../core/exceptions/ValueException.js";

export type DeliveryStatusValue = "completed" | "delivering" | "cancelled";

export class DeliveryStatus {
  public value: DeliveryStatusValue;
  constructor(value: string) {
    if (
      value === "completed" ||
      value === "delivering" ||
      value === "cancelled"
    ) {
      this.value = value;
    } else {
      throw new ValueException(
        "Delivery status can only be 'arrived', 'delivering', 'preparing', 'cancelled'"
      );
    }
  }
}
