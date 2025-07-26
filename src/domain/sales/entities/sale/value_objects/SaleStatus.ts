import { ValueException } from "../../../../../core/exceptions/ValueException.js";

export type SaleStatusValues = "completed" | "in progress" | "cancelled";

export class SaleStatus {
  public readonly value: SaleStatusValues;
  constructor(value: SaleStatusValues) {
    if (
      value === "completed" ||
      value === "in progress" ||
      value === "cancelled"
    ) {
      this.value = value;
    } else {
      throw new ValueException("Invalid sale status");
    }
  }
}
