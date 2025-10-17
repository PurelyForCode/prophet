import { EntityId } from "../../../../core/types/EntityId.js"

export type ForecastDatabaseTable = {
	id: EntityId
	account_id: EntityId
	product_id: EntityId
	croston_model_id: EntityId | null
	prophet_model_id: EntityId | null
	model_type: string
	data_depth: number
	forecast_start_date: Date
	forecast_end_date: Date
	processed: boolean
	created_at: Date
	updated_at: Date
	deleted_at: Date | null
}
