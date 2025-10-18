import { BaseRepository } from "../../../core/interfaces/Repository.js"
import { EntityCollection } from "../../../core/types/EntityCollection.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { AccountPermission } from "../entities/account/value_objects/AccountPermission.js"

export interface IAccountPermissionRepository
	extends BaseRepository<AccountPermission> {
	findByAccountId(
		accountId: EntityId,
	): Promise<EntityCollection<AccountPermission>>
}
