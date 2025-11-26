import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class ProphetChangepointNotFoundException extends ApplicationException {
	constructor() {
		super("Prophet model changepoint not found", 404)
	}
}
