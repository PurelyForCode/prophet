export type SaleDatabaseTable = {
	id: string;
	account_id: string;
	product_id: string;
	quantity: number;
	status: string;
	date: Date;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date | null;
};

