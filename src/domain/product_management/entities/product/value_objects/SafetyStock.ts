import { ValueException } from "../../../../../core/exceptions/ValueException.js";

export class SafetyStock {
  constructor(public readonly value: number) {
    if (value < 0) {
      throw new ValueException("Safety stock quantity cannot be negative");
    }
  }
}
