import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class DuplicateSeasonalityNameException extends ApplicationException {
	constructor() {
		super("Duplicate seasonality name declared on model", 409)
	}
}
