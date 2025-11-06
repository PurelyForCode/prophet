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
	ds: Date
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
		await this.knex(this.tableName).insert(table)
	}

	async update(table: ProphetHolidayDatabaseTable) {
		await this.knex(this.tableName).update(table).where("id", "=", table.id)
	}

	async delete(id: EntityId) {
		await this.knex(this.tableName).delete().where("id", "=", id)
	}

	mapToDto(row: ProphetHolidayDatabaseTable): ProphetHolidayDto {
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
