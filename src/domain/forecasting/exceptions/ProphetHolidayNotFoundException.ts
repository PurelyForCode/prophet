import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class ProphetHolidayNotFoundException extends ApplicationException {
	constructor() {
		super("Prophet model holiday not found", 404)
	}
}
