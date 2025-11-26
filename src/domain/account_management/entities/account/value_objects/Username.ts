import { ValueException } from "../../../../../core/exceptions/ValueException.js"

export class Username {
	public readonly value: string

	constructor(value: string) {
		if (!value || value.trim().length === 0) {
			throw new ValueException("Username can not be empty")
		}

		if (value.length > 32) {
			throw new ValueException("Username can not exceed 32 characters")
		}
		this.value = value
	}
}
