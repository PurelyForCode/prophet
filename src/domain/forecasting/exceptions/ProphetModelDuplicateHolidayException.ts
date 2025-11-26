import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class ProphetModelDuplicateHolidayException extends ApplicationException {
	constructor() {
		super("Prophet model holiday configuration duplicated", 409)
	}
}
