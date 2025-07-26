import { ApplicationException } from "../../../core/exceptions/ApplicationException.js";

export class DuplicateProductNameException extends ApplicationException {
  constructor() {
    super("Product name is already taken", 409);
  }
}
