import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class PermissionNotGrantedToAccountException extends ApplicationException {
	constructor() {
		super("Permission does not exist on account", 404)
	}
}
