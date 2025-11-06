import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"

export type ProphetChangepointDto = {
	id: EntityId
	modelSettingId: EntityId
	changepointDate: Date
}

export type ProphetChangepointDatabaseTable = {
	id: EntityId
	changepoint_date: Date
	model_setting_id: EntityId
}

export class ProphetChangepointDao {
	private tableName: string = "prophet_setting_changepoint"

	constructor(private readonly knex: Knex) {}

	async findAllByModelId(modelId: EntityId) {
		const rows = await this.knex(this.tableName)
			.select("changepoint_date", "id", "model_setting_id")
			.where("model_setting_id", "=", modelId)
		const result = []
		for (const row of rows) {
			result.push(this.mapToDto(row))
		}
		return result
	}

	async insert(table: ProphetChangepointDatabaseTable) {
		await this.knex(this.tableName).insert(table)
	}

	async update(table: ProphetChangepointDatabaseTable) {
		await this.knex(this.tableName).update(table).where("id", "=", table.id)
	}

	async delete(id: EntityId) {
		await this.knex(this.tableName).delete().where("id", "=", id)
	}

	mapToDto(row: ProphetChangepointDatabaseTable): ProphetChangepointDto {
		return {
			changepointDate: row.changepoint_date,
			id: row.id,
			modelSettingId: row.model_setting_id,
		}
	}
}
