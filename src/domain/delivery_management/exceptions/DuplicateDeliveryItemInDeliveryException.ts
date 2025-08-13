import { ApplicationException } from "../../../core/exceptions/ApplicationException.js";

export class DuplicateDeliveryItemInDeliveryException extends ApplicationException {
  constructor() {
    super("Item is already added in the delivery", 409);
  }
}
