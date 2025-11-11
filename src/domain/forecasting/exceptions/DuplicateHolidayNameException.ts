import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class DuplicateHolidayNameException extends ApplicationException {
	constructor() {
		super("Duplicate holiday name declared on model", 409)
	}
}
