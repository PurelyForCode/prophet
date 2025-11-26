import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"

export type ProphetSeasonDto = {
	id: EntityId
	modelSettingId: EntityId
	name: string
	periodDays: number
	fourierOrder: number
	priorScale: number
	mode: string
}

export type ProphetSeasonDatabaseTable = {
	id: EntityId
	model_setting_id: EntityId
	name: string
	period_days: number
	fourier_order: number
	prior_scale: number
	mode: string
}

export class ProphetSeasonDao {
	private tableName: string = "prophet_setting_season"

	constructor(private readonly knex: Knex) {}

	async findAllByModelId(modelId: EntityId) {
		const rows = await this.knex(this.tableName)
			.select("*")
			.where("model_setting_id", "=", modelId)
		const result = []
		for (const row of rows) {
			result.push(this.mapToDto(row))
		}
		return result
	}

	async insert(table: ProphetSeasonDatabaseTable) {
		await this.knex(this.tableName).insert(table)
	}

	async update(table: ProphetSeasonDatabaseTable) {
		await this.knex(this.tableName).update(table).where("id", "=", table.id)
	}

	async delete(id: EntityId) {
		await this.knex(this.tableName).delete().where("id", "=", id)
	}

	mapToDto(row: ProphetSeasonDatabaseTable): ProphetSeasonDto {
		return {
			id: row.id,
			modelSettingId: row.model_setting_id,
			fourierOrder: row.fourier_order,
			mode: row.mode,
			name: row.name,
			periodDays: row.period_days,
			priorScale: row.prior_scale,
		}
	}
}
