import { ApplicationException } from "../../../core/exceptions/ApplicationException.js";

export class DuplicateCategoryNameException extends ApplicationException {
  constructor() {
    super("Category name is already taken", 409);
  }
}
