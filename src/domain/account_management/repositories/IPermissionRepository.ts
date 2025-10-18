import { EntityId } from "../../../core/types/EntityId.js"
import { Permission } from "../entities/permission/Permission.js"

export interface IPermissionRepository {
	findById(id: EntityId): Promise<Permission | null>
}
