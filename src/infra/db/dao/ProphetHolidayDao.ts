import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"

export type ProphetHolidayDto = {
	id: EntityId
	modelSettingId: EntityId
	holidayName: string
	ds: Date
	lowerWindow: number
	upperWindow: number
}

export type ProphetHolidayDatabaseTable = {
	id: EntityId
	model_setting_id: EntityId
	holiday_name: string
	ds: Date[]
	lower_window: number
	upper_window: number
}

export class ProphetHolidayDao {
	private tableName: string = "prophet_setting_holiday"

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

	async insert(table: ProphetHolidayDatabaseTable) {
		await this.knex(this.tableName).insert({
			ds: table.ds.map((d) => d.toISOString().slice(0, 10)),
			holiday_name: table.holiday_name,
			id: table.id,
			lower_window: table.lower_window,
			model_setting_id: table.model_setting_id,
			upper_window: table.upper_window,
		})
	}

	async update(table: ProphetHolidayDatabaseTable) {
		await this.knex(this.tableName)
			.update({
				ds: table.ds.map((d) => d.toISOString().slice(0, 10)),
				holiday_name: table.holiday_name,
				id: table.id,
				lower_window: table.lower_window,
				model_setting_id: table.model_setting_id,
				upper_window: table.upper_window,
			})
			.where("id", "=", table.id)
	}

	async delete(id: EntityId) {
		await this.knex(this.tableName).delete().where("id", "=", id)
	}

	mapToDto(row: any): ProphetHolidayDto {
		return {
			id: row.id,
			modelSettingId: row.model_setting_id,
			ds: row.ds,
			holidayName: row.holiday_name,
			lowerWindow: row.lower_window,
			upperWindow: row.upper_window,
		}
	}
}
