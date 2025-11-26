import { ApplicationException } from "./ApplicationException.js";

export class InternalServerError extends ApplicationException {
  constructor() {
    super("Internal Server Error", 500);
  }
}
