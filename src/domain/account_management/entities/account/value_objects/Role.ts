import { ValueException } from "../../../../../core/exceptions/ValueException.js"

export type RoleValues = "store manager" | "superadmin" | "admin" | "staff"

export class Role {
	public readonly value: RoleValues

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
