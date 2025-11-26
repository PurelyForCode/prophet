import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class IncorrectPasswordException extends ApplicationException {
	constructor() {
		super("Incorrect passoword", 401)
	}
}
