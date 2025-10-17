import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class UsernameIsTakenException extends ApplicationException {
	constructor() {
		super("Username is already taken", 409)
	}
}
