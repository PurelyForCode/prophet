
export type ProductSettingDatabaseTable = {
	id: string;
	product_id: string;
	classification: string;
	fill_rate: number;
	service_level: number;
	safety_stock_calculation_method: string;
	updated_at: Date;
};

