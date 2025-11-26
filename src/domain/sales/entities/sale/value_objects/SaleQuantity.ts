import { ValueException } from "../../../../../core/exceptions/ValueException.js";

export class SaleQuantity {
  public readonly value: number;

  constructor(value: number) {
    if (!Number.isInteger(value)) {
      throw new ValueException("Sale quantity must be an integer.");
    }
    if (value <= 0) {
      throw new ValueException("Sale quantity must be greater than zero.");
    }
    this.value = value;
  }
}
