import { Entity } from "../../../../../core/interfaces/Entity.js"
import { EntityId } from "../../../../../core/types/EntityId.js"

export class AccountPermission extends Entity<{
	accountId: EntityId
	permissionId: EntityId
}> {
	constructor(id: { accountId: EntityId; permissionId: EntityId }) {
		super(id)
	}
}
