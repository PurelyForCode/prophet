import { ApplicationException } from "../../../core/exceptions/ApplicationException.js";

export class ProductNotInCategoryException extends ApplicationException {
  constructor() {
    super("Product is not in category", 409);
  }
}
