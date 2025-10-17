import { ValueException } from "../../../../../core/exceptions/ValueException.js"

export class InventoryStatus {
	public readonly value: string
	constructor(value: string) {
		if (value !== "critical" && value !== "urgent" && value !== "good") {
			throw new ValueException(
				"Inventory status can only be 'critical', 'urgent', 'good'",
			)
		}
		this.value = value
	}
}
