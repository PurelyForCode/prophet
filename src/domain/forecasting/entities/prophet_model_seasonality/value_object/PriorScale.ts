import { ValueException } from "../../../../../core/exceptions/ValueException.js"

export class PriorScale {
	public readonly value: number

	constructor(value: number) {
		if (value <= 0) {
			throw new ValueException("Prior scale must be greater than 0")
		}
		if (value > 100) {
			throw new ValueException("Prior scale must not exceed 100")
		}
		this.value = value
	}
}
