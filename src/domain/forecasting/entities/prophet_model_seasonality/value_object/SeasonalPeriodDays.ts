import { ValueException } from "../../../../../core/exceptions/ValueException.js"

export class SeasonalPeriodDays {
	public readonly value: number
	constructor(value: number) {
		if (value <= 0) {
			throw new ValueException(
				"Seasonal period days must be higher than 0",
			)
		}
		this.value = value
	}
}
