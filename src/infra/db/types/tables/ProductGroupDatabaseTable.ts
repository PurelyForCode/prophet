import { EntityId } from "../../../../core/types/EntityId.js"

export type ProductGroupDatabaseTable = {
	id: EntityId
	product_category_id: EntityId | null
	account_id: EntityId
	name: string
	created_at: Date
	updated_at: Date
	deleted_at: Date | null
}
