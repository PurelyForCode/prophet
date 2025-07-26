import { ApplicationException } from "../../../core/exceptions/ApplicationException.js";

export class ProductNotFoundException extends ApplicationException {
  constructor() {
    super("Product is not found", 404);
  }
}
