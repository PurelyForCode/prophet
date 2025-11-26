import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { AccountPermissionDatabaseTable } from "../types/tables/AccountPermissionDatabaseTable.js"
import { AccountPermission } from "../../../domain/account_management/entities/account/value_objects/AccountPermission.js"

export type AccountPermissionDto = {
	accountId: EntityId
	permissionId: EntityId
}

export class AccountPermissionDao {
	private tableName = "account_permission"
	constructor(private readonly knex: Knex) {}

	async insert(table: AccountPermissionDatabaseTable) {
		await this.knex<AccountPermissionDatabaseTable>(this.tableName).insert(
			table,
		)
	}

	async delete(accountId: EntityId, permissionId: EntityId) {
		await this.knex(this.tableName)
			.delete()
			.where("account_id", "=", accountId)
			.where("permission_id", "=", permissionId)
	}

	async findByAccountId(accountId: EntityId) {
		const rows = await this.knex<AccountPermissionDatabaseTable>(
			this.tableName,
		)
			.select("*")
			.where("account_id", "=", accountId)
		let accountPermissions = []
		for (const row of rows) {
			const accountPermission = this.mapToDTO(row)
			accountPermissions.push(accountPermission)
		}
		return accountPermissions
	}

	mapToDTO(row: AccountPermissionDatabaseTable): AccountPermissionDto {
		return {
			accountId: row.account_id,
			permissionId: row.permission_id,
		}
	}
}
