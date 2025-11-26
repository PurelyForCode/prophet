import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class PermissionGranteeNotFoundException extends ApplicationException {
	constructor() {
		super("Permission grantee not found", 404)
	}
}
