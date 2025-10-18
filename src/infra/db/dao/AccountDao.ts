import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { AccountDatabaseTable } from "../types/tables/AccountDatabaseTable.js"

export type AccountDTO = {
	id: EntityId
	username: string
	password: string
	role: string
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
}

export class AccountDAO {
	private tableName = "account"
	constructor(private readonly knex: Knex) {}

	async insert(table: AccountDatabaseTable) {
		await this.knex<AccountDatabaseTable>(this.tableName).insert(table)
	}

	async update(table: AccountDatabaseTable) {
		await this.knex<AccountDatabaseTable>(this.tableName)
			.update(table)
			.where("id", "=", table.id)
	}

	async delete(id: EntityId) {
		await this.knex(this.tableName).delete().where("id", "=", id)
	}

	async findById(id: EntityId) {
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

	async doesSuperAdminExist() {
		return (await this.knex(this.tableName)
			.first()
			.where("role", "=", "superadmin"))
			? true
			: false
	}

	async findByUsername(username: string) {
		const row = await this.knex<AccountDatabaseTable>(this.tableName)
			.select("*")
			.where("username", "=", username)
			.first()
		if (!row) {
			return null
		} else {
			return this.mapToDTO(row)
		}
	}

	mapToDTO(row: AccountDatabaseTable): AccountDTO {
		return {
			password: row.password,
			createdAt: row.created_at,
			deletedAt: row.deleted_at,
			id: row.id,
			username: row.username,
			role: row.role,
			updatedAt: row.updated_at,
		}
	}
}
