import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class ProphetModelNotFoundException extends ApplicationException {
	constructor() {
		super("Prophet model not found", 404)
	}
}
