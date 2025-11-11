import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class ProphetModelMissingHolidayException extends ApplicationException {
	constructor() {
		super("Prophet model holiday not found", 404)
	}
}
