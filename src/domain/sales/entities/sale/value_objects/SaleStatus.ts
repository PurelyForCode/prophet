import { ValueException } from "../../../../../core/exceptions/ValueException.js"

export type SaleStatusValues = "completed" | "pending" | "cancelled"

export class SaleStatus {
	public readonly value: SaleStatusValues
	constructor(value: string) {
		if (
			value === "completed" ||
			value === "pending" ||
			value === "cancelled"
		) {
			this.value = value
		} else {
			throw new ValueException("Invalid sale status")
		}
	}
}
