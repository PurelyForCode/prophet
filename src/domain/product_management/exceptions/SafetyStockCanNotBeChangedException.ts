import { ApplicationException } from "../../../core/exceptions/ApplicationException.js";

export class SafetyStockCanNotBeChanged extends ApplicationException {
  constructor() {
    super(
      "This product's safety stock is controlled by the system, change its safety stock calculation method to manual to change it manually",
      409
    );
  }
}
