import { Knex } from "knex"
import { ProphetModelDatabaseTable } from "../types/tables/ProphetModelDatabaseTable.js"
import { EntityId } from "../../../core/types/EntityId.js"

export type ProphetModelDTO = {
	id: string
	productId: string
	filePath: string | null
	active: boolean
	trainedAt: Date | null
}

export class ProphetModelDAO {
	private tableName = "prophet_model"
	constructor(private readonly knex: Knex) {}

	async doesProductHaveActiveModel(productId: EntityId) {
		const exists = await this.knex<ProphetModelDatabaseTable>(
			this.tableName,
		)
			.select("id")
			.where("product_id", "=", productId)
			.where("active", true)
			.first()

		if (exists) {
			return true
		} else {
			return false
		}
	}

	async insert(table: ProphetModelDatabaseTable) {
		await this.knex<ProphetModelDatabaseTable>(this.tableName).insert(table)
	}

	async update(table: ProphetModelDatabaseTable) {
		await this.knex<ProphetModelDatabaseTable>(this.tableName)
			.update(table)
			.where("id", "=", table.id)
	}

	async delete(id: EntityId) {
		await this.knex(this.tableName).delete().where("id", "=", id)
	}

	async findById(id: EntityId) {
		const row = await this.knex(this.tableName)
			.select("*")
			.where("id", "=", id)
			.first()
		if (!row) {
			return null
		} else {
			return this.mapToDTO(row)
		}
	}

	mapToDTO(row: ProphetModelDatabaseTable): ProphetModelDTO {
		return {
			id: row.id,
			active: row.active,
			filePath: row.file_path,
			productId: row.product_id,
			trainedAt: row.trained_at,
		}
	}
}
