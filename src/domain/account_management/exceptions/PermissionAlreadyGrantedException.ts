import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class PermissionAlreadyGrantedException extends ApplicationException {
	constructor() {
		super("Permission already granted to account", 409)
	}
}
