import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class DuplicateChangepointDateException extends ApplicationException {
	constructor() {
		super("Duplicate changepoint date declared on model", 409)
	}
}
