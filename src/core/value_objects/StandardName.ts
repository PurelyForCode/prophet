import { ValueException } from "../exceptions/ValueException.js"

export class StandardName {
	public readonly value: string
	constructor(value: string, fieldName: string) {
		fieldName =
			fieldName.charAt(0).toUpperCase() + fieldName.slice(1).toLowerCase()
		if (value.length <= 0 || value.length >= 100) {
			throw new ValueException(
				`${fieldName} should be less than 100 and more than 1 character`,
			)
		}
		this.value = value
	}
}
