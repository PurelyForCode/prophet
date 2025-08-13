import { ValueException } from "../../../../../core/exceptions/ValueException.js";

export class SuppliedProductMin {
  public readonly value: number;
  constructor(value: number) {
    if (value < 1) {
      throw new ValueException("Min can not be below 1");
    }
    if (!Number.isInteger(value)) {
      throw new ValueException("Min must be an integer");
    }
    this.value = value;
  }
}
