import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { ForecastEntryDatabaseTable } from "../types/tables/ForecastEntryDatabaseTable.js"

export type ForecastEntryDto = {
	id: EntityId
	forecastId: EntityId
	yhat: number
	yhatUpper: number
	yhatLower: number
	date: Date
}

export class ForecastEntryDao {
	private tableName = "forecast_entry"
	constructor(private readonly knex: Knex) {}

	async findByForecastId(forecastId: EntityId): Promise<ForecastEntryDto[]> {
		const rows = await this.knex(this.tableName)
			.select("*")
			.where("forecast_id", "=", forecastId)
		let entries: ForecastEntryDto[] = []
		for (const row of rows) {
			const entry = this.mapToDTO(row)
			entries.push(entry)
		}
		return entries
	}

	mapToDTO(row: ForecastEntryDatabaseTable): ForecastEntryDto {
		return {
			id: row.id,
			forecastId: row.forecast_id,
			yhat: row.yhat,
			yhatUpper: row.yhat_upper,
			yhatLower: row.yhat_lower,
			date: row.date,
		}
	}
}
