import { Knex } from "knex"
import { ProductSettingDatabaseTable } from "../types/tables/ProductSettingDatabaseTable.js"

export type ProductSettingQueryDto = {
	classification: string
	safetyStockCalculationMethod: string
	serviceLevel: number
	fillRate: number
	updatedAt: Date
}

export class ProductSettingDAO {
	private tableName = "product_setting"
	constructor(private readonly knex: Knex.Transaction | Knex) {}

	async queryByProductId(productId: string) {
		const row = await this.knex<ProductSettingDatabaseTable>(this.tableName)
			.select("*")
			.where("product_id", "=", productId)
			.first()
		if (!row) {
			return null
		}
		return this.mapToQueryDto(row)
	}

	private mapToQueryDto(
		row: ProductSettingDatabaseTable,
	): ProductSettingQueryDto {
		return {
			classification: row.classification,
			safetyStockCalculationMethod: row.safety_stock_calculation_method,
			fillRate: row.fill_rate,
			serviceLevel: row.service_level,
			updatedAt: row.updated_at,
		}
	}
}

export type JoinedProductSettingTableColumns = {
	setting_classification: string
	setting_safety_stock_calculation_method: string
	setting_service_level: number
	setting_fill_rate: number
	setting_updated_at: Date
}
