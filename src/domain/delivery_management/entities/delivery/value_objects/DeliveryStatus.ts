import { ValueException } from "../../../../../core/exceptions/ValueException.js"

export type DeliveryStatusValue = "completed" | "pending" | "cancelled"

export class DeliveryStatus {
	public value: DeliveryStatusValue
	constructor(value: string) {
		if (
			value === "completed" ||
			value === "pending" ||
			value === "cancelled"
		) {
			this.value = value
		} else {
			throw new ValueException(
				"Delivery status can only be 'completed', 'pending' or 'cancelled'",
			)
		}
	}
}
