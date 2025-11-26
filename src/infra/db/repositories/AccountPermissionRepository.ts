import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { IAccountPermissionRepository } from "../../../domain/account_management/repositories/IAccountPermissionRepository.js"
import {
	AccountPermissionDao,
	AccountPermissionDto,
} from "../dao/AccountPermissionDao.js"
import { AccountPermission } from "../../../domain/account_management/entities/account/value_objects/AccountPermission.js"

export class AccountPermissionRepository
	implements IAccountPermissionRepository
{
	private accountPermissionDao: AccountPermissionDao
	constructor(knex: Knex) {
		this.accountPermissionDao = new AccountPermissionDao(knex)
	}

	async delete(entity: AccountPermission): Promise<void> {
		await this.accountPermissionDao.delete(
			entity.id.accountId,
			entity.id.permissionId,
		)
	}

	async create(entity: AccountPermission): Promise<void> {
		await this.accountPermissionDao.insert({
			account_id: entity.id.accountId,
			permission_id: entity.id.permissionId,
		})
	}
	async findByAccountId(accountId: EntityId) {
		const accountPermissionDtos =
			await this.accountPermissionDao.findByAccountId(accountId)
		let accountPermissions = new Map()
		for (const accountPermissionDto of accountPermissionDtos) {
			const accountPermission = this.mapToEntity(accountPermissionDto)
			accountPermissions.set(
				accountPermission.id.permissionId,
				accountPermission,
			)
		}
		return accountPermissions
	}

	async update(_entity: AccountPermission): Promise<void> {
		throw new Error("Operation not allowed")
	}

	mapToEntity(account: AccountPermissionDto): AccountPermission {
		return AccountPermission.create(account.accountId, account.permissionId)
	}
}
