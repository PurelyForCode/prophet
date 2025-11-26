import { ValueException } from "../../../../../core/exceptions/ValueException.js"

export class ChangepointSelectionMethod {
	public readonly value: "auto" | "manual"
	constructor(value: string) {
		if (value !== "auto" && value !== "manual") {
			throw new ValueException(
				"Changepoint selection method must either be 'auto' or 'manual'",
			)
		}
		this.value = value
	}
}
