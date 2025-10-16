import { ValueException } from "../../../../../core/exceptions/ValueException.js"

export class GrowthType {
	public readonly value: "logistic" | "linear"
	constructor(value: string) {
		if (value !== "logistic" && value !== "linear") {
			throw new ValueException(
				"Growth type must either be 'logistic' or 'linear'",
			)
		}
		this.value = value
	}
}
