import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { SupplierDatabaseTable } from "../types/tables/SupplierDatabaseTable.js"

export type SupplierDTO = {
	id: EntityId
	accountId: EntityId
	name: string
	leadTime: number
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
}

export class SupplierDAO {
	private tableName = "supplier"
	constructor(private readonly knex: Knex) {}
	async insert(table: SupplierDatabaseTable) {
		await this.knex<SupplierDatabaseTable>(this.tableName).insert({
			account_id: table.account_id,
			created_at: table.created_at,
			deleted_at: table.deleted_at,
			id: table.id,
			lead_time: table.lead_time,
			name: table.name,
		})
	}

	async delete(id: EntityId) {
		await this.knex(this.tableName).delete().where({ id: id })
	}

	async update(table: SupplierDatabaseTable) {
		await this.knex<SupplierDatabaseTable>(this.tableName)
			.update({
				account_id: table.account_id,
				created_at: table.created_at,
				deleted_at: table.deleted_at,
				id: table.id,
				lead_time: table.lead_time,
				name: table.name,
			})
			.where({ id: table.id })
	}

	async findById(id: EntityId): Promise<SupplierDTO | null> {
		const row = await this.knex<SupplierDatabaseTable>(this.tableName)
			.select("*")
			.where({ id: id })
			.first()
		if (!row) {
			return null
		} else {
			return this.mapToDTO(row)
		}
	}

	async findByName(name: string): Promise<SupplierDTO | null> {
		const row = await this.knex<SupplierDatabaseTable>(this.tableName)
			.select("*")
			.where({ name: name })
			.first()
		if (!row) {
			return null
		} else {
			return this.mapToDTO(row)
		}
	}

	async findDefaultSupplier(productId: EntityId) {
		const row = await this.knex<SupplierDatabaseTable>(
			`${this.tableName} as s`,
		)
			.select("s.*")
			.join("product_supplier as ps", "ps.supplier_id", "s.id")
			.where("ps.product_id", "=", productId)
			.where("ps.is_default", true)
			.first()

		if (!row) {
			return null
		}

		return this.mapToDTO(row)
	}

	private mapToDTO(row: SupplierDatabaseTable): SupplierDTO {
		return {
			accountId: row.account_id,
			createdAt: row.created_at,
			deletedAt: row.deleted_at,
			id: row.id,
			leadTime: row.lead_time,
			name: row.name,
			updatedAt: row.updated_at,
		}
	}
}
