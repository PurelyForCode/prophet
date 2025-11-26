import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class DuplicateAccountUsernameException extends ApplicationException {
	constructor() {
		super("Username is already taken", 409)
	}
}
