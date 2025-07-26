import { ApplicationException } from "../../../core/exceptions/ApplicationException.js";

export class ProductIsArchived extends ApplicationException {
  constructor() {
    super("Product is archived", 410);
  }
}
