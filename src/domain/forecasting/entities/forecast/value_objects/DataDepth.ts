import { ValueException } from "../../../../../core/exceptions/ValueException.js"

export class DataDepth {
	constructor(value: number) {
		if (value < 1) {
			throw new ValueException("Data depth can not be less than 1%")
		}
	}
}
