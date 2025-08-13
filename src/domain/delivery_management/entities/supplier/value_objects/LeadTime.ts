import { ValueException } from "../../../../../core/exceptions/ValueException.js";

export class LeadTime {
  public readonly value: number;
  constructor(value: number) {
    if (!Number.isInteger(value)) {
      throw new ValueException("Lead time must be an integer");
    }

    if (value < 0) {
      throw new ValueException("Lead time must not be below 0");
    }
    this.value = value;
  }
}
