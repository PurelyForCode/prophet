import { EntityId } from "../../../../core/types/EntityId.js"

export type InventoryRecommendationDatabaseTable = {
	id: EntityId
	forecast_id: EntityId
	supplier_id: EntityId
	leadtime: number
	status: string
	runs_out_at: Date
	restock_at: Date
	restock_amount: number
	coverage_days: number
	created_at: Date
	updated_at: Date
}
