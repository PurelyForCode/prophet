import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { ForecastDatabaseTable } from "../types/tables/ForecastDatabaseTable.js"

export type ForecastDto = {
	id: EntityId
	accountId: EntityId
	productId: EntityId
	modelType: string
	crostonModelId: EntityId | null
	prophetModelId: EntityId | null
	dataDepth: number
	forecastStartDate: Date
	forecastEndDate: Date
	processed: boolean
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
}

export class ForecastDao {
	private tableName = "forecast"
	constructor(private readonly knex: Knex) {}

	async insert(table: ForecastDatabaseTable) {
		await this.knex(this.tableName).insert(table)
	}
	async update(table: ForecastDatabaseTable) {
		await this.knex(this.tableName).update(table).where("id", "=", table.id)
	}
	async delete(id: EntityId) {
		await this.knex(this.tableName).delete().where("id", "=", id)
	}

	async findById(id: EntityId) {
		const row = await this.knex<ForecastDatabaseTable>(this.tableName)
			.select("*")
			.where("id", "=", id)
			.first()

		if (!row) {
			return null
		} else {
			return this.mapToDTO(row)
		}
	}

	mapToDTO(row: ForecastDatabaseTable): ForecastDto {
		return {
			id: row.id,
			crostonModelId: row.croston_model_id,
			modelType: row.model_type,
			prophetModelId: row.prophet_model_id,
			accountId: row.account_id,
			productId: row.product_id,
			dataDepth: row.data_depth,
			forecastEndDate: row.forecast_end_date,
			forecastStartDate: row.forecast_start_date,
			processed: row.processed,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
			deletedAt: row.deleted_at,
		}
	}
}
