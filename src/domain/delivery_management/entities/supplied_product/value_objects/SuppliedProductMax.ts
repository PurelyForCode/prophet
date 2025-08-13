import { ValueException } from "../../../../../core/exceptions/ValueException.js";

export class SuppliedProductMax {
  public readonly value: number;
  constructor(value: number) {
    if (value < 1) {
      throw new ValueException("Max can not be below 1");
    }
    if (!Number.isInteger(value)) {
      throw new ValueException("Max must be an integer");
    }
    this.value = value;
  }
}
