import { ValueException } from "../../../../../core/exceptions/ValueException.js"

export class DataDepth {
	public readonly value: number
	constructor(value: number) {
		if (value < 1) {
			throw new ValueException("Forecast's data depth can not be below 1")
		}
		this.value = value
	}
}
