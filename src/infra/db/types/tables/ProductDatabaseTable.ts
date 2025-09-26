export type ProductDatabaseTable = {
	id: string;
	account_id: string;
	product_id: null;
	product_category_id: string | null;
	name: string;
	stock: number;
	safety_stock: number;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date | null;
};

