import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { SaleDatabaseTable } from "../types/tables/SaleDatabaseTable.js"

export type SaleDto = {
	id: EntityId
	account_id: EntityId
	product_id: EntityId
	quantity: number
	status: string
	date: Date
	created_at: Date
	updated_at: Date
	deleted_at: Date | null
}

export class SaleDAO {
	private tableName = "sale"
	constructor(private readonly knex: Knex) {}
	async delete(id: EntityId) {
		await this.knex<SaleDatabaseTable>(this.tableName)
			.delete()
			.where({ id: id })
	}

	async doesSaleExistInDate(date: Date): Promise<boolean> {
		const result = await this.knex<SaleDatabaseTable>(this.tableName)
			.select(this.knex.raw("1"))
			.where("date", "=", date)
			.first()
		if (result) {
			return true
		} else {
			return false
		}
	}

	async insert(input: SaleDatabaseTable) {
		await this.knex<SaleDatabaseTable>(this.tableName).insert(input)
	}

	async update(input: SaleDatabaseTable) {
		await this.knex<SaleDatabaseTable>(this.tableName)
			.update(input)
			.where({ id: input.id })
	}

	async findById(id: EntityId): Promise<SaleDto | null> {
		const row = await this.knex<SaleDatabaseTable>(this.tableName)
			.select("*")
			.where("id", "=", id)
			.first()
		if (row) {
			return this.mapToDto(row)
		} else {
			return null
		}
	}


	mapToDto(row: SaleDatabaseTable): SaleDto {
		return {
			id: row.id,
			product_id: row.product_id,
			account_id: row.account_id,
			date: row.date,
			quantity: row.quantity,
			status: row.status,
			created_at: row.created_at,
			updated_at: row.updated_at,
			deleted_at: row.deleted_at,
		}
	}
}
