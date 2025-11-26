import { ApplicationException } from "../../../core/exceptions/ApplicationException.js";

export class DeliveryNotFoundException extends ApplicationException {
  constructor() {
    super("Delivery is not found", 404);
  }
}
