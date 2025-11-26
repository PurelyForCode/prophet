import { ApplicationException } from "../../../core/exceptions/ApplicationException.js";

export class VariantNotFoundException extends ApplicationException {
  constructor() {
    super("Variant is not found", 404);
  }
}
