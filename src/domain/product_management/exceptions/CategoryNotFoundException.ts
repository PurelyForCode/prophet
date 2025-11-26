import { ApplicationException } from "../../../core/exceptions/ApplicationException.js";

export class CategoryNotFoundException extends ApplicationException {
  constructor() {
    super("Category not found", 404);
  }
}
