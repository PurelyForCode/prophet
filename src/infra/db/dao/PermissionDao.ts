import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { AccountDatabaseTable } from "../types/tables/AccountDatabaseTable.js"
import { PermissionDatabaseTable } from "../types/tables/PermissionDatabaseTable.js"

export type PermissionDto = {
	id: EntityId
	name: string
	createdAt: Date
	updatedAt: Date
}

export class PermissionDao {
	private tableName = "permission"
	constructor(private readonly knex: Knex) {}

	async findAll() {
		const rows = await this.knex<PermissionDatabaseTable>(
			this.tableName,
		).select("*")

		let permissions = new Map()
		for (const row of rows) {
			const permission = this.mapToDTO(row)
			permissions.set(permission.id, permission)
		}
		return permissions
	}
	async findById(id: EntityId) {
		const row = await this.knex<PermissionDatabaseTable>(this.tableName)
			.select("*")
			.where("id", "=", id)
			.first()
		if (!row) {
			return null
		} else {
			return this.mapToDTO(row)
		}
	}

	async doesSuperAdminExist() {
		return (await this.knex(this.tableName)
			.first()
			.where("role", "=", "superadmin"))
			? true
			: false
	}

	mapToDTO(row: PermissionDatabaseTable): PermissionDto {
		return {
			createdAt: row.created_at,
			id: row.id,
			name: row.name,
			updatedAt: row.updated_at,
		}
	}
}
