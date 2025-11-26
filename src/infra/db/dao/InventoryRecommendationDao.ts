import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { InventoryRecommendationDatabaseTable } from "../types/tables/InventoryRecommendationDatabaseTable.js"

export type InventoryRecommendationDto = {
	id: EntityId
	status: string
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

	async findByForecastId(id: EntityId) {
		const row = await this.knex<InventoryRecommendationDatabaseTable>(
			this.tableName,
		)
			.select("*")
			.where("forecast_id", "=", id)
			.first()

		if (!row) {
			return null
		} else {
			return this.mapToDTO(row)
		}
	}

	async findById(id: EntityId) {
		const row = await this.knex<InventoryRecommendationDatabaseTable>(
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

	async insert(table: InventoryRecommendationDatabaseTable) {
		await this.knex(this.tableName).insert(table)
	}

	async delete(id: EntityId) {
		await this.knex(this.tableName).delete().where("id", "=", id)
	}

	async update(table: InventoryRecommendationDatabaseTable) {
		await this.knex(this.tableName).update(table).where("id", "=", table.id)
	}

	mapToDTO(
		row: InventoryRecommendationDatabaseTable,
	): InventoryRecommendationDto {
		return {
			id: row.id,
			forecastId: row.forecast_id,
			supplierId: row.supplier_id,
			coverageDays: row.coverage_days,
			leadtime: row.leadtime,
			restockAmount: row.restock_amount,
			status: row.status,
			restockAt: row.restock_at,
			runsOutAt: row.runs_out_at,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		}
	}
}
