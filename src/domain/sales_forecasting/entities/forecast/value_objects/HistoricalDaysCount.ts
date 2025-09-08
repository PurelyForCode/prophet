import { ValueException } from "../../../../../core/exceptions/ValueException.js";

export class HistoricalDaysCount {
  public readonly value: number;
  constructor(value: number) {
    if (value < 1) {
      throw new ValueException(
        "Sales forecast's data depth can not be below 1"
      );
    }
    this.value = value;
  }
}
