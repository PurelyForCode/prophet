import { ApplicationException } from "../../../core/exceptions/ApplicationException.js";

export class SupplierDuplicateNameException extends ApplicationException {
  constructor() {
    super("Supplier name is already taken", 409);
  }
}
