import { EntityId } from "../../../../core/types/EntityId.js"

export type ProphetModelDatabaseTable = {
	id: EntityId
	product_id: EntityId
	name: string
	file_path: string | null
	active: boolean
	trained_at: Date | null
}
