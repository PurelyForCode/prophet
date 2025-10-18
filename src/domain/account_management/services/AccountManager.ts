import { EntityAction } from "../../../core/interfaces/AggregateRoot.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { Account } from "../entities/account/Account.js"
import { Password } from "../entities/account/value_objects/Password.js"
import { Role } from "../entities/account/value_objects/Role.js"
import { Username } from "../entities/account/value_objects/Username.js"

export class AccountManager {
	createAccount(
		id: EntityId,
		role: Role,
		username: Username,
		password: Password,
	) {
		const now = new Date()
		let permissions = new Map()

		if (role.value === "store manager") {
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
		account.addTrackedEntity(account, EntityAction.created)
		return account
	}

	archiveAccount() {}
}
