import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class ProphetModelDuplicateChangepointException extends ApplicationException {
	constructor() {
		super("Prophet model changepoint configuration duplicated", 409)
	}
}
