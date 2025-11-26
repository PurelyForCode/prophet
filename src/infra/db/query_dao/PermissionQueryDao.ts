import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { PermissionDatabaseTable } from "../types/tables/PermissionDatabaseTable.js"

export type PermissionQueryDto = {
	id: EntityId
	name: string
}

export class PermissionQueryDao {
	private tableName = "permission"
	constructor(private readonly knex: Knex) {}

	async queryAllAccountPermissions(accountId: EntityId) {
		const rows = await this.knex<{ name: string; id: EntityId }>(
			"account_permission as ap",
		)
			.join("permission as p", "p.id", "ap.permission_id")
			.select("p.name", "p.id")
			.where("ap.account_id", "=", accountId)
		return rows as { name: string; id: EntityId }[]
	}

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
