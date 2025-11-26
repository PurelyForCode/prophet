import { EntityId } from "../../../../core/types/EntityId.js"

export type DeliveryDatabaseTable = {
	id: EntityId
	supplier_id: EntityId
	account_id: EntityId
	status: string
	completed_at: Date | null
	requested_at: Date
	scheduled_arrival_date: Date
	cancelled_at: Date | null
	created_at: Date
	updated_at: Date
	deleted_at: Date | null
}
