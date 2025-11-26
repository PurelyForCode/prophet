import { ApplicationException } from "../../../core/exceptions/ApplicationException.js";

export class InvalidSaleTargetException extends ApplicationException {
  constructor() {
    super("Sale exists but does not belong to the product or variant", 404);
  }
}
