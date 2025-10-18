import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class PermissionNotFoundException extends ApplicationException {
	constructor() {
		super("Permission not found", 404)
	}
}
