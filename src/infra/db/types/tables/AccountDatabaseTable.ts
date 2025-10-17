import { EntityId } from "../../../../core/types/EntityId.js"

export type AccountDatabaseTable = {
	id: EntityId
	username: string
	password: string
	role: string
	created_at: Date
	updated_at: Date
	deleted_at: Date | null
}
