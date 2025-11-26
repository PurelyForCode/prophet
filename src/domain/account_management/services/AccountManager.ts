import { EntityAction } from "../../../core/interfaces/AggregateRoot.js"
import { EntityId } from "../../../core/types/EntityId.js"
import {
	Account,
	AccountUpdateableFields,
} from "../entities/account/Account.js"
import { Password } from "../entities/account/value_objects/Password.js"
import { Role } from "../entities/account/value_objects/Role.js"
import { Username } from "../entities/account/value_objects/Username.js"
import { IPermissionRepository } from "../repositories/IPermissionRepository.js"
import { IAccountRepository } from "../repositories/IAccountRepository.js"
import { DuplicateAccountUsernameException } from "../exceptions/DuplicateAccountUsernameException.js"

export class AccountManager {
	async createAccount(
		accountRepo: IAccountRepository,
		permissionRepo: IPermissionRepository,
		id: EntityId,
		role: Role,
		username: Username,
		password: Password,
	) {
		const taken = await accountRepo.findByUsername(username)
		if (taken) {
			throw new DuplicateAccountUsernameException()
		}

		const now = new Date()
		let permissions = new Map()

		if (role.value === "staff") {
			permissions = await permissionRepo.findDefaultStaffPermissions()
		}

		const account = Account.create({
			id,
			createdAt: now,
			deletedAt: null,
			password,
			role,
			updatedAt: now,
			username,
			permissions: permissions,
		})

		if (role.value === "staff") {
			const permissions =
				await permissionRepo.findDefaultStaffPermissions()
			for (const permission of permissions.values()) {
				account.grantPermission(permission)
			}
		}

		account.addTrackedEntity(account, EntityAction.created)
		return account
	}

	archiveAccount(account: Account) {
		account.archive()
		return account
	}

	async updateAccount(
		permissionRepo: IPermissionRepository,
		accountRepo: IAccountRepository,
		account: Account,
		fields: Partial<AccountUpdateableFields>,
	) {
		if (fields.role) {
			const originalRole = account.role.value
			account.role = new Role(fields.role)

			if (
				originalRole === "staff" &&
				(account.role.value === "store manager" ||
					account.role.value === "admin")
			) {
				for (const perm of account.permissions.values()) {
					account.revokePermission(perm.id.permissionId)
				}
			} else if (
				(originalRole === "store manager" ||
					originalRole === "admin") &&
				account.role.value === "staff"
			) {
				const permissions =
					await permissionRepo.findDefaultStaffPermissions()
				for (const perm of permissions.values()) {
					account.grantPermission(perm)
				}
			}
		}
		if (fields.username) {
			const username = new Username(fields.username)
			const exists = await accountRepo.findByUsername(username)
			if (exists) {
				throw new DuplicateAccountUsernameException()
			}
			account.username = username
		}
		account.addTrackedEntity(account, EntityAction.updated)
	}
}
