import { ApplicationException } from "../../../core/exceptions/ApplicationException.js";

export class ProductIsAlreadyArchived extends ApplicationException {
  constructor() {
    super("Product is already archived", 409);
  }
}
