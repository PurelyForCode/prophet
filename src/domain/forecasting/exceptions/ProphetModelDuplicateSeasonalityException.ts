import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class ProphetModelDuplicateSeasonalityException extends ApplicationException {
	constructor() {
		super("Prophet model seasonality configuration duplicated", 409)
	}
}
