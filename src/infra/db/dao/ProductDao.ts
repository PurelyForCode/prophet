import { Knex } from "knex"
import {
	JoinedProductSettingTableColumns,
	ProductSettingDTO,
} from "./ProductSettingDao.js"
import { ProductDatabaseTable } from "../types/tables/ProductDatabaseTable.js"
import { EntityId } from "../../../core/types/EntityId.js"

export type ProductDto = {
	id: string
	groupId: string
	accountId: string
	name: string
	saleCount: number
	stock: number
	safetyStock: number
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
	setting: ProductSettingDTO
}

export type ProductTable = ProductDatabaseTable &
	JoinedProductSettingTableColumns

export class ProductDao {
	private tableName = "product"
	constructor(private readonly knex: Knex) {}

	async insert(input: ProductDatabaseTable) {
		await this.knex<ProductDatabaseTable>(this.tableName).insert(input)
	}

	async update(input: ProductDatabaseTable) {
		await this.knex<ProductDatabaseTable>(this.tableName)
			.update(input)
			.where({ id: input.id })
	}

	async delete(id: EntityId) {
		await this.knex<ProductTable>(this.tableName).delete().where({ id })
	}

	async existsByName(name: string) {
		const builder = this.knex("product")
			.select(
				this.knex.raw(
					"exists (select 1 from product where name = ? AND where product_id IS NULL)",
					[name],
				),
			)
			.first()
		const row = await builder
		if (row) {
			return row.exists
		} else {
			return false
		}
	}

	async findOneById(id: EntityId): Promise<ProductDto | null> {
		const builder = this.knex(`${this.tableName} as p`)
			.select("p.*")
			.where("p.id", id)
			.first()
		this.joinSettings(builder)
		const row = await builder
		if (row) {
			return this.mapToDTO(row)
		} else {
			return null
		}
	}

	async findAllByCategoryId(categoryId: EntityId) {
		const builder = this.knex(`${this.tableName} as p`)
			.select("p.*")
			.where("p.product_category_id", "=", categoryId)
		this.joinSettings(builder)
		const rows = await builder
		return rows.map((row) => this.mapToDTO(row))
	}

	async findOneByName(name: string): Promise<ProductDto | null> {
		const builder = this.knex(`${this.tableName} as p`)
			.select("p.*")
			.where("p.name", name)
			.first()
		this.joinSettings(builder)
		const row = await builder
		if (!row) {
			return null
		} else {
			return this.mapToDTO(row)
		}
	}

	async findAll(): Promise<ProductDto[]> {
		const builder = this.knex<ProductTable>(
			`${this.tableName} as p`,
		).select()
		this.joinSettings(builder)
		const rows = await builder
		return rows.map((row) => this.mapToDTO(row))
	}

	async findAllByGroupId(groupId: EntityId): Promise<ProductDto[]> {
		const builder = this.knex(`${this.tableName} as p`)
			.select("p.*")
			.where("p.group_id", "=", groupId)
		this.joinSettings(builder)
		const rows = await builder
		return rows.map((row) => this.mapToDTO(row))
	}

	joinSettings(builder: Knex.QueryBuilder) {
		builder
			.join("product_setting as s", "p.id", "=", "s.product_id")
			.select(
				"s.classification as setting_classification",
				"s.safety_stock_calculation_method as setting_safety_stock_calculation_method",
				"s.service_level as setting_service_level",
				"s.fill_rate as setting_fill_rate",
				"s.updated_at as setting_updated_at",
			)
	}

	async exists(id: EntityId): Promise<boolean> {
		const result = await this.knex(this.tableName)
			.where("id", "=", id)
			.first()
		return !!result
	}

	mapToDTO(row: ProductTable & JoinedProductSettingTableColumns): ProductDto {
		return {
			id: row.id,
			accountId: row.account_id,
			saleCount: row.sale_count,
			groupId: row.group_id,
			name: row.name,
			safetyStock: row.safety_stock,
			createdAt: row.created_at,
			deletedAt: row.deleted_at,
			setting: {
				classification: row.setting_classification,
				fillRate: row.setting_fill_rate,
				safetyStockCalculationMethod:
					row.setting_safety_stock_calculation_method,
				serviceLevel: row.setting_service_level,
				updatedAt: row.setting_updated_at,
			},
			stock: row.stock,
			updatedAt: row.updated_at,
		}
	}
}
