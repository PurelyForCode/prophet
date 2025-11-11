import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class ProphetModelMissingSeasonalityException extends ApplicationException {
	constructor() {
		super("Prophet model seasonality not found", 404)
	}
}
