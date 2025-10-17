import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class ForecastOutOfDateException extends ApplicationException {
	constructor() {
		super(
			"Forecast is out of date, please forecast again to receive a recommendation",
			409,
		)
	}
}
