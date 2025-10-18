import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { IAccountRepository } from "../../../domain/account_management/repositories/IAccountRepository.js"
import { Username } from "../../../domain/account_management/entities/account/value_objects/Username.js"
import { AccountDAO, AccountDTO } from "../dao/AccountDao.js"
import { Account } from "../../../domain/account_management/entities/account/Account.js"
import { Role } from "../../../domain/account_management/entities/account/value_objects/Role.js"
import { Password } from "../../../domain/account_management/entities/account/value_objects/Password.js"
import { AccountPermission } from "../../../domain/account_management/entities/account/value_objects/AccountPermission.js"
import { EntityCollection } from "../../../core/types/EntityCollection.js"
import { AccountPermissionDao } from "../dao/AccountPermissionDao.js"

export class AccountRepository implements IAccountRepository {
	private accountDao: AccountDAO
	private accountPermissionDao: AccountPermissionDao
	constructor(knex: Knex) {
		this.accountDao = new AccountDAO(knex)
		this.accountPermissionDao = new AccountPermissionDao(knex)
	}

	async doesSuperAdminExist(): Promise<boolean> {
		return await this.accountDao.doesSuperAdminExist()
	}

	async findByUsername(username: Username): Promise<null | Account> {
		const result = await this.accountDao.findByUsername(username.value)
		if (!result) return null
		const permissions = await this.accountPermissionDao.findByAccountId(
			result.id,
		)
		return this.mapToEntity(result, permissions)
	}

	async delete(entity: Account): Promise<void> {
		await this.accountDao.delete(entity.id)
	}

	async update(entity: Account): Promise<void> {
		await this.accountDao.update({
			password: entity.password.value,
			role: entity.role.value,
			username: entity.username.value,
			created_at: entity.createdAt,
			updated_at: entity.updatedAt,
			deleted_at: entity.deletedAt,
			id: entity.id,
		})
	}

	async create(entity: Account): Promise<void> {
		await this.accountDao.insert({
			password: entity.password.value,
			role: entity.role.value,
			username: entity.username.value,
			created_at: entity.createdAt,
			updated_at: entity.updatedAt,
			deleted_at: entity.deletedAt,
			id: entity.id,
		})
	}

	async findById(id: EntityId): Promise<Account | null> {
		const result = await this.accountDao.findById(id)
		if (!result) return null
		const permissions = await this.accountPermissionDao.findByAccountId(
			result.id,
		)

		return this.mapToEntity(result, permissions)
	}

	mapToEntity(
		account: AccountDTO,
		permissions: EntityCollection<AccountPermission>,
	): Account {
		return Account.create({
			id: account.id,
			createdAt: account.createdAt,
			deletedAt: account.deletedAt,
			password: new Password(account.password),
			role: new Role(account.role),
			updatedAt: account.updatedAt,
			username: new Username(account.username),
			permissions: permissions,
		})
	}
}
