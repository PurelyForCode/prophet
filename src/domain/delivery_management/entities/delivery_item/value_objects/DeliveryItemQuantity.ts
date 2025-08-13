import { ValueException } from "../../../../../core/exceptions/ValueException.js";

export class DeliveryItemQuantity {
  constructor(public readonly value: number) {
    if (value < 0) {
      throw new ValueException("Delivery item quantity cannot be negative");
    }
  }
}
