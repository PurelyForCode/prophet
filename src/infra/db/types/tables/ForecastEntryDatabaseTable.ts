import { EntityId } from "../../../../core/types/EntityId.js"

export type ForecastEntryDatabaseTable = {
	id: EntityId
	forecast_id: EntityId
	yhat: number
	yhat_upper: number
	yhat_lower: number
	date: Date
}
