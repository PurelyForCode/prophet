import { ValueException } from "../../../../../core/exceptions/ValueException.js"

export class ModelType {
	public readonly value: "croston" | "prophet"
	constructor(value: string) {
		if (value !== "croston" && value !== "prophet") {
			throw new ValueException(
				"Model type should be either 'croston' or 'prophet'",
			)
		}
		this.value = value
	}
}
