import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { ForecastDatabaseTable } from "../types/tables/ForecastDatabaseTable.js"
import { InventoryRecommendationTable } from "../types/tables/InventoryRecommendationTable.js"

export type InventoryRecommendationDto = {
	id: EntityId
	forecastId: EntityId
	supplierId: EntityId
	leadtime: number
	runsOutAt: Date
	restockAt: Date
	restockAmount: number
	coverageDays: number
	createdAt: Date
	updatedAt: Date
}

export class InventoryRecommendationDao {
	private tableName = "inventory_recommendation"

	constructor(private readonly knex: Knex) {}

	async findById(id: EntityId) {
		const row = await this.knex<InventoryRecommendationTable>(
			this.tableName,
		)
			.select("*")
			.where("id", "=", id)
			.first()

		if (!row) {
			return null
		} else {
			return this.mapToDTO(row)
		}
	}

	async insert(table: InventoryRecommendationTable) {
		await this.knex(this.tableName).insert(table)
	}

	async delete(id: EntityId) {
		await this.knex(this.tableName).delete().where("id", "=", id)
	}

	async update(table: InventoryRecommendationTable) {
		await this.knex(this.tableName).update(table).where("id", "=", table.id)
	}

	mapToDTO(row: InventoryRecommendationTable): InventoryRecommendationDto {
		return {
			id: row.id,
			forecastId: row.forecast_id,
			supplierId: row.supplier_id,
			coverageDays: row.coverage_days,
			leadtime: row.leadtime,
			restockAmount: row.restock_amount,
			restockAt: row.restock_at,
			runsOutAt: row.runs_out_at,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		}
	}
}
