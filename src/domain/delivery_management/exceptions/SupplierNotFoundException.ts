import { ApplicationException } from "../../../core/exceptions/ApplicationException.js";

export class SupplierNotFoundException extends ApplicationException {
  constructor() {
    super("Supplier not found", 404);
  }
}
