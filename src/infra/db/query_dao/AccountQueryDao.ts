import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { AccountDatabaseTable } from "../types/tables/AccountDatabaseTable.js"
import { PermissionQueryDto } from "./PermissionQueryDao.js"
import { Pagination } from "../types/queries/Pagination.js"

export type AccountQueryDto = {
	id: EntityId
	username: string
	role: string
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
	permissions: PermissionQueryDto[]
}

export type AccountSortableFields = "role"
export type AccountIncludeField = "permissions"

export class AccountQueryDao {
	private tableName = "account"
	constructor(private readonly knex: Knex) {}

	async query(pagination: Pagination, filters: Partial<{}>, include: ) {}
	async queryById(id: EntityId) {
		const row = await this.knex<AccountDatabaseTable>(this.tableName)
			.select("*")
			.where("id", "=", id)
			.first()
		if (!row) {
			return null
		} else {
			return this.mapToDTO(row)
		}
	}

	mapToQueryDto(row: AccountDatabaseTable): AccountQueryDto {
		return {
			createdAt: row.created_at,
			deletedAt: row.deleted_at,
			id: row.id,
			username: row.username,
			role: row.role,
			updatedAt: row.updated_at,
		}
	}
}
