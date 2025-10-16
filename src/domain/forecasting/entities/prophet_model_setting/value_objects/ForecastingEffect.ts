import { ValueException } from "../../../../../core/exceptions/ValueException.js"

export class ForecastingEffect {
	public readonly value: "additive" | "multiplicative"
	constructor(value: string) {
		if (value !== "additive" && value !== "multiplicative") {
			throw new ValueException(
				"Seasonality mode must either be 'additive' or 'multiplicative'",
			)
		}
		this.value = value
	}
}
