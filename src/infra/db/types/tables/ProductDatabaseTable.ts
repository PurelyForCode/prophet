export type ProductDatabaseTable = {
	id: string
	account_id: string
	sale_count: number
	group_id: string
	name: string
	stock: number
	safety_stock: number
	created_at: Date
	updated_at: Date
	deleted_at: Date | null
}
