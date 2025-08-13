import { ValueException } from "../../../../../core/exceptions/ValueException.js";

export class SupplierName {
  public readonly value: string;
  constructor(value: string) {
    if (value.length < 1) {
      throw new ValueException("Supplier name can not be empty");
    }
    if (value.length > 100) {
      throw new ValueException(
        "Supplier name can not be longer than 100 characters"
      );
    }
    this.value = value;
  }
}
