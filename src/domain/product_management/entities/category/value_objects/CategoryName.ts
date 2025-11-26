import { ValueException } from "../../../../../core/exceptions/ValueException.js";

export class CategoryName {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new ValueException("Category name cannot be empty");
    }

    if (value.length > 30) {
      throw new ValueException(
        "Category name cannot be more than 30 characters"
      );
    }
  }
}
