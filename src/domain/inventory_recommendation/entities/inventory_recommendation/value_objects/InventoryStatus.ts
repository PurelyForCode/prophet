import { ValueException } from "../../../../../core/exceptions/ValueException.js"

export type InventoryStatusValues = "urgent" | "critical" | "warning" | "good"
export class InventoryStatus {
	public readonly value: InventoryStatusValues
	constructor(value: string) {
		if (
			value !== "critical" &&
			value !== "urgent" &&
			value !== "warning" &&
			value !== "good"
		) {
			throw new ValueException(
				"Inventory status can only be 'critical', 'urgent', 'good'",
			)
		}
		this.value = value
	}
}
