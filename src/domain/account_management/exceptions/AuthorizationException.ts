import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class AuthorizationException extends ApplicationException {
	constructor() {
		super("The user is not authorized to perform that request", 401)
	}
}
