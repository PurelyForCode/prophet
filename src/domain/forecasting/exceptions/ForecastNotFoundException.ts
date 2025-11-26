import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class ForecastNotFoundException extends ApplicationException {
	constructor() {
		super("Forecast not found", 404)
	}
}
