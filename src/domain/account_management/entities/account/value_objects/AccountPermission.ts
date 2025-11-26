import { Entity } from "../../../../../core/interfaces/Entity.js"
import { EntityId } from "../../../../../core/types/EntityId.js"

export class AccountPermission extends Entity<{
	accountId: EntityId
	permissionId: EntityId
}> {
	private constructor(id: { accountId: EntityId; permissionId: EntityId }) {
		super(id)
	}
	static create(accountId: EntityId, permissionId: EntityId) {
		return new AccountPermission({ accountId, permissionId })
	}
}
