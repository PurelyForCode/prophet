import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { AccountDatabaseTable } from "../types/tables/AccountDatabaseTable.js"
import { PermissionQueryDao, PermissionQueryDto } from "./PermissionQueryDao.js"
import { defaultPagination, Pagination } from "../types/queries/Pagination.js"
import { Sort, sortQuery } from "../utils/Sort.js"

export type AccountQueryDto = {
	id: EntityId
	username: string
	role: string
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
	permissions: PermissionQueryDto[] | undefined
}

export type AccountSortableFields = "role"
export type AccountIncludeField = "permissions"

type AccountQueryInclude =
	| Partial<{
			permissions: boolean
	  }>
	| undefined

type AccountQueryFilter =
	| Partial<{
			role: string
			archived: boolean
			username: string
	  }>
	| undefined

export class AccountQueryDao {
	private tableName = "account"

	private readonly accountSortFieldMap: Record<
		AccountSortableFields,
		string
	> = {
		role: "role",
	}
	constructor(private readonly knex: Knex) {}

	async query(
		pagination: Pagination,
		filters: AccountQueryFilter,
		include: AccountQueryInclude,
		sort: Sort<AccountSortableFields>,
	) {
		const builder = this.knex<AccountDatabaseTable>(this.tableName).select(
			"*",
		)

		if (pagination) {
			if (pagination.limit) {
				builder.limit(pagination.limit)
			}
			if (pagination.offset) {
				builder.offset(pagination.offset)
			}
		} else {
			builder.limit(defaultPagination.limit)
			builder.offset(defaultPagination.offset)
		}

		if (filters?.archived) {
			builder.whereNotNull("deleted_at")
		} else {
			builder.whereNull("deleted_at")
		}
		if (filters) {
			if (filters.role) {
				builder.where("role", "=", filters.role)
			}
		}

		if (sort) {
			sortQuery(builder, sort, this.accountSortFieldMap)
		} else {
			sortQuery(builder, ["-role"], this.accountSortFieldMap)
		}

		const rows = await builder
		let accounts = []

		for (const row of rows) {
			let permissions = undefined
			if (include) {
				if (include.permissions) {
					const permissionQueryDao = new PermissionQueryDao(this.knex)
					permissions =
						await permissionQueryDao.queryAllAccountPermissions(
							row.id,
						)
				}
			}
			accounts.push(this.mapToQueryDto(row, permissions))
		}
		return accounts
	}

	async queryById(id: EntityId, include: AccountQueryInclude) {
		const row = await this.knex<AccountDatabaseTable>(this.tableName)
			.select("*")
			.where("id", "=", id)
			.first()

		if (!row) return null

		let permissions = undefined

		if (include) {
			if (include.permissions) {
				const permissionQueryDao = new PermissionQueryDao(this.knex)
				permissions =
					await permissionQueryDao.queryAllAccountPermissions(row.id)
			}
		}

		return this.mapToQueryDto(row, permissions)
	}

	mapToQueryDto(
		row: AccountDatabaseTable,
		permissions: PermissionQueryDto[] | undefined,
	): AccountQueryDto {
		return {
			id: row.id,
			username: row.username,
			role: row.role,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
			deletedAt: row.deleted_at,
			permissions,
		}
	}
}
