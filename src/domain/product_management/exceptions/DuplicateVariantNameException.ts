import { ApplicationException } from "../../../core/exceptions/ApplicationException.js";

export class DuplicateVariantNameException extends ApplicationException {
  constructor() {
    super("Variant name is already taken", 409);
  }
}
