import { ApplicationException } from "../../../core/exceptions/ApplicationException.js";

export class DeliveryItemNotFoundException extends ApplicationException {
  constructor() {
    super("Delivery item is not found", 404);
  }
}
