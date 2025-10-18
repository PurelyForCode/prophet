import { ValueException } from "../../../../../core/exceptions/ValueException.js"

export class Role {
	public readonly value: string

	constructor(value: string) {
		if (
			value !== "store manager" &&
			value !== "superadmin" &&
			value !== "admin" &&
			value !== "staff"
		) {
			throw new ValueException("Invalid account role")
		}
		this.value = value
	}
}
