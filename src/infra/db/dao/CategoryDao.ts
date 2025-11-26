import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { CategoryDatabaseTable } from "../types/tables/CategoryDatabaseTable.js"

export type CategoryDTO = {
	id: EntityId
	accountId: EntityId
	name: string
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
}

export class CategoryDAO {
	private tableName = "product_category"
	constructor(private readonly knex: Knex) {}

	async insert(table: CategoryDatabaseTable) {
		await this.knex<CategoryDatabaseTable>(this.tableName).insert({
			id: table.id,
			name: table.name,
			account_id: table.account_id,
			created_at: table.created_at,
			updated_at: table.updated_at,
			deleted_at: table.deleted_at,
		})
	}

	async update(table: CategoryDatabaseTable) {
		await this.knex<CategoryDatabaseTable>(this.tableName)
			.update({
				id: table.id,
				name: table.name,
				account_id: table.account_id,
				created_at: table.created_at,
				updated_at: table.updated_at,
				deleted_at: table.deleted_at,
			})
			.where("id", "=", table.id)
	}

	async delete(id: EntityId) {
		await this.knex<CategoryDatabaseTable>(this.tableName)
			.delete()
			.where("id", "=", id)
	}

	async findById(id: EntityId) {
		const row = await this.knex<CategoryDatabaseTable>(this.tableName)
			.select("*")
			.where("id", "=", id)
			.first()
		if (!row) {
			return null
		} else {
			return this.mapToDTO(row)
		}
	}

	async findByName(name: string) {
		const row = await this.knex<CategoryDatabaseTable>(this.tableName)
			.select("*")
			.where("name", "=", name)
			.first()
		if (!row) {
			return null
		} else {
			return this.mapToDTO(row)
		}
	}

	mapToDTO(row: CategoryDatabaseTable): CategoryDTO {
		return {
			accountId: row.account_id,
			createdAt: row.created_at,
			deletedAt: row.deleted_at,
			id: row.id,
			name: row.name,
			updatedAt: row.updated_at,
		}
	}
}
