import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { AccountDatabaseTable } from "../types/tables/AccountDatabaseTable.js"
import { PermissionDatabaseTable } from "../types/tables/PermissionDatabaseTable.js"

export type PermissionQueryDto = {
	id: EntityId
	name: string
}

export class PermissionQueryDao {
	private tableName = "permission"
	constructor(private readonly knex: Knex) {}

	async query() {
		const rows = await this.knex<PermissionDatabaseTable>(
			this.tableName,
		).select("id", "name")
		let permissions = []
		for (const row of rows) {
			const perm = this.mapToQueryDto(row)
			permissions.push(perm)
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
			return this.mapToQueryDto(row)
		}
	}

	mapToQueryDto(row: { name: string; id: string }): PermissionQueryDto {
		return {
			id: row.id,
			name: row.name,
		}
	}
}
