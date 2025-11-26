import { EntityId } from "../../../../core/types/EntityId.js"

export type PermissionDatabaseTable = {
	id: EntityId
	name: string
	created_at: Date
	updated_at: Date
}
