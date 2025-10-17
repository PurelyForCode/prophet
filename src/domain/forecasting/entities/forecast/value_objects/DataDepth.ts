import { ValueException } from "../../../../../core/exceptions/ValueException.js"

export class DataDepth {
	public readonly value: number
	constructor(value: number) {
		if (value < 1) {
			throw new ValueException("Data depth can not be less than 1%")
		}
		this.value = value
	}
}
