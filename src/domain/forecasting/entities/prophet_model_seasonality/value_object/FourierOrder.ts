import { ValueException } from "../../../../../core/exceptions/ValueException.js"

export class FourierOrder {
	public readonly value: number

	constructor(value: number) {
		if (!Number.isInteger(value) || value <= 0) {
			throw new ValueException("Fourier order must be a positive integer")
		}
		this.value = value
	}
}
