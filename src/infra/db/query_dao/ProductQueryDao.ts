import { Knex } from "knex"
import {
	JoinedProductSettingTableColumns,
	ProductSettingQueryDto,
} from "./ProductQuerySettingDao.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { ProductDatabaseTable } from "../types/tables/ProductDatabaseTable.js"
import { defaultPagination, Pagination } from "../types/queries/Pagination.js"
import { SaleQueryDao, SaleQueryDto } from "./SaleQueryDao.js"
import { QuerySort } from "../types/queries/QuerySort.js"
import { Sort, sortQuery } from "../utils/Sort.js"
import { group } from "node:console"

export type ProductQueryDto = {
	id: string
	accountId: string
	groupId: string
	name: string
	stock: number
	safetyStock: number
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
	setting: ProductSettingQueryDto | undefined
	sales: SaleQueryDto[] | undefined
}

export type ProductSortableFields = "name" | "stock"

export type ProductQuerySort = QuerySort<ProductSortableFields> | undefined
export type ProductIncludeField = "sales" | "settings"
export type ProductQueryInclude =
	| Partial<{
			sales: boolean
			settings: boolean
	  }>
	| undefined

export type ProductQueryFilters =
	| Partial<{
			name: string
			archived: boolean
			groupId: EntityId
	  }>
	| undefined

export type ProductTable = ProductDatabaseTable &
	JoinedProductSettingTableColumns

export class ProductQueryDao {
	private tableName = "product"
	private readonly productSortFieldMap: Record<
		ProductSortableFields,
		string
	> = {
		name: "p.name",
		stock: "p.stock",
	}

	constructor(private readonly knex: Knex) {}

	async query(
		pagination: Pagination,
		filters: ProductQueryFilters,
		include: ProductQueryInclude,
		sort: Sort<ProductSortableFields>,
	) {
		const builder = this.knex<
			ProductDatabaseTable & JoinedProductSettingTableColumns
		>(`${this.tableName} as p`).select("p.*")

		if (pagination) {
			if (pagination.limit) {
				builder.limit(pagination.limit)
			}
			if (pagination.offset) {
				builder.offset(pagination.offset)
			}
		}

		if (filters && filters.archived === true) {
			builder.whereNotNull("p.deleted_at")
		} else {
			builder.whereNull("p.deleted_at")
		}

		if (filters) {
			if (filters.name) {
				builder.where("p.name", "%", filters.name)
			}

			if (filters.groupId) {
				builder.where("p.group_id", "=", filters.groupId)
			}
		}

		if (include && include.settings) {
			this.joinSettings(builder)
		}
		if (sort) {
			sortQuery(builder, sort, this.productSortFieldMap)
		} else {
			sortQuery(builder, ["name"], this.productSortFieldMap)
		}

		const rows = await builder
		let products: ProductQueryDto[] = []
		for (const row of rows) {
			let sales: SaleQueryDto[] | undefined = undefined
			let setting: JoinedProductSettingTableColumns | undefined =
				undefined
			if (include) {
				if (include.sales) {
					const saleQueryDto = new SaleQueryDao(this.knex)
					let archived: boolean | undefined = undefined
					if (filters && filters.archived) {
						archived = filters.archived
					}
					sales = await saleQueryDto.query(
						undefined,
						{
							productId: row.id,
							archived: archived,
						},
						["-date"],
					)
				}
				if (include.settings) {
					setting = {
						setting_classification: row.setting_classification,
						setting_fill_rate: row.setting_fill_rate,
						setting_safety_stock_calculation_method:
							row.setting_safety_stock_calculation_method,
						setting_service_level: row.setting_service_level,
						setting_updated_at: row.setting_updated_at,
					}
				}
			}
			products.push(this.mapToQueryDTO(row, setting, sales))
		}
		return products
	}

	async queryById(id: EntityId, include: ProductQueryInclude) {
		const builder = this.knex<
			ProductDatabaseTable & JoinedProductSettingTableColumns
		>(this.tableName)
			.select("*")
			.where("id", "=", id)
			.first()

		if (include && include.settings) {
			this.joinSettings(builder)
		}

		const row = await builder
		if (!row) {
			return null
		}
		let sales: SaleQueryDto[] | undefined = undefined
		let setting: JoinedProductSettingTableColumns | undefined = undefined

		if (include) {
			if (include.sales) {
				const saleQueryDto = new SaleQueryDao(this.knex)
				let archived: boolean | undefined = undefined
				sales = await saleQueryDto.query(
					defaultPagination,
					{
						productId: row.id,
						archived: archived,
					},
					undefined,
				)
			}
			if (include.settings) {
				setting = {
					setting_classification: row.setting_classification,
					setting_fill_rate: row.setting_fill_rate,
					setting_safety_stock_calculation_method:
						row.setting_safety_stock_calculation_method,
					setting_service_level: row.setting_service_level,
					setting_updated_at: row.setting_updated_at,
				}
			}
		}
		return this.mapToQueryDTO(row, setting, sales)
	}

	async queryOneFromGroupIdById(
		id: EntityId,
		groupId: EntityId,
		include: ProductQueryInclude,
	) {
		const builder = this.knex<
			ProductDatabaseTable & JoinedProductSettingTableColumns
		>(this.tableName)
			.select("*")
			.where("id", "=", id)
			.where("group_id", "=", groupId)
			.first()

		if (include && include.settings) {
			this.joinSettings(builder)
		}

		const row = await builder
		if (!row) {
			return null
		}
		let sales: SaleQueryDto[] | undefined = undefined
		let setting: JoinedProductSettingTableColumns | undefined = undefined
		if (include) {
			if (include.sales) {
				const saleQueryDto = new SaleQueryDao(this.knex)
				let archived: boolean | undefined = undefined
				sales = await saleQueryDto.query(
					{ limit: 50, offset: 0 },
					{
						productId: row.id,
						archived: archived,
					},
					undefined,
				)
			}
			if (include.settings) {
				setting = {
					setting_classification: row.setting_classification,
					setting_fill_rate: row.setting_fill_rate,
					setting_safety_stock_calculation_method:
						row.setting_safety_stock_calculation_method,
					setting_service_level: row.setting_service_level,
					setting_updated_at: row.setting_updated_at,
				}
			}
		}
		return this.mapToQueryDTO(row, setting, sales)
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

	mapToQueryDTO(
		product: ProductDatabaseTable,
		setting: JoinedProductSettingTableColumns | undefined,
		sales: SaleQueryDto[] | undefined,
	): ProductQueryDto {
		let settingQueryDto: ProductSettingQueryDto | undefined = undefined
		if (setting) {
			settingQueryDto = {
				classification: setting.setting_classification,
				fillRate: setting.setting_fill_rate,
				safetyStockCalculationMethod:
					setting.setting_safety_stock_calculation_method,
				serviceLevel: setting.setting_service_level,
				updatedAt: setting.setting_updated_at,
			}
		}
		return {
			id: product.id,
			groupId: product.group_id,
			accountId: product.account_id,
			name: product.name,
			safetyStock: product.safety_stock,
			stock: product.stock,
			createdAt: product.created_at,
			updatedAt: product.updated_at,
			deletedAt: product.deleted_at,
			setting: settingQueryDto,
			sales: sales,
		}
	}
}
