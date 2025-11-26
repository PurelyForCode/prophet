import { ValueException } from "../../../../../core/exceptions/ValueException.js";

export class ProductStock {
  constructor(public readonly value: number) {
    if (value < 0) {
      throw new ValueException("Stock quantity cannot be negative");
    }
  }
}
