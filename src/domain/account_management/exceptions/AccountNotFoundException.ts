import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class AccountNotFoundException extends ApplicationException {
	constructor() {
		super("Account not found", 404)
	}
}
