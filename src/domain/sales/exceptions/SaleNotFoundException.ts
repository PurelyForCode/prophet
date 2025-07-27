import { ApplicationException } from "../../../core/exceptions/ApplicationException.js";

export class SaleNotFoundException extends ApplicationException {
  constructor() {
    super("Sale is not found", 404);
  }
}
