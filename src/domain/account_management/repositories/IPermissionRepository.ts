import { EntityCollection } from "../../../core/types/EntityCollection.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { Permission } from "../entities/permission/Permission.js"

export interface IPermissionRepository {
	findById(id: EntityId): Promise<Permission | null>
	findAll(): Promise<EntityCollection<Permission>>
	findDefaultStaffPermissions(): Promise<EntityCollection<Permission>>
}
