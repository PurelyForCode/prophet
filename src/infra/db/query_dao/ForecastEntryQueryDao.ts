import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { ForecastEntryDatabaseTable } from "../types/tables/ForecastEntryDatabaseTable.js"
import { BaseQueryDao } from "./BaseQueryDao.js"

export type ForecastEntryQueryDto = {
	id: EntityId
	yhat: number
	yhatUpper: number
	yhatLower: number
	date: Date
}

export class ForecastEntryQueryDao extends BaseQueryDao {
	constructor(knex: Knex) {
		super(knex, "forecast_entry")
	}

	async query(filters: Partial<{ forecastId: EntityId }>) {
		const builder = this.knex(this.tableName).select("*")
		if (filters) {
			if (filters.forecastId) {
				builder.where("forecast_id", "=", filters.forecastId)
			}
		}
		const rows = await builder
		const forecastEntries = []
		for (const row of rows) {
			forecastEntries.push(this.mapToQueryDto(row))
		}
		return forecastEntries
	}
	mapToQueryDto(row: ForecastEntryDatabaseTable): ForecastEntryQueryDto {
		return {
			id: row.id,
			date: row.date,
			yhat: row.yhat,
			yhatLower: row.yhat_lower,
			yhatUpper: row.yhat_upper,
		}
	}
}
