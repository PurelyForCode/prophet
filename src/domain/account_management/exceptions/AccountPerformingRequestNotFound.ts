import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class AccountPerformingRequestNotFoundException extends ApplicationException {
	constructor() {
		super("Account that is performing the request not found", 404)
	}
}
