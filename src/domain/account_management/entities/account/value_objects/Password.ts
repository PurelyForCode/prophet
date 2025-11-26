import { ValueException } from "../../../../../core/exceptions/ValueException.js"

export class Password {
	public readonly value: string

	constructor(value: string) {
		const password = value.trim()
		if (password.length < 8) {
			throw new ValueException(
				"Password can not be less than 8 characters",
			)
		}
		this.value = value
	}
}
