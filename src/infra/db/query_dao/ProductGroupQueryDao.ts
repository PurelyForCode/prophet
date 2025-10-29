import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { ProductName } from "../../../domain/product_management/entities/product/value_objects/ProductName.js"
import { ProductGroupDatabaseTable } from "../types/tables/ProductGroupDatabaseTable.js"
import {
	ProductQueryDao,
	ProductQueryDto,
	ProductQueryInclude,
} from "./ProductQueryDao.js"
import { defaultPagination, Pagination } from "../types/queries/Pagination.js"
import { Sort, sortQuery } from "../utils/Sort.js"
import { BaseQueryDao } from "./BaseQueryDao.js"

export type ProductGroupQueryDto = {
	id: EntityId
	categoryId: EntityId | null
	accountId: EntityId
	name: string
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
	products: ProductQueryDto[]
}

export type ProductGroupIncludeFields = "productSales" | "productSettings"

export type ProductGroupQueryInclude =
	| Partial<{
			productSales: boolean
			productSettings: boolean
	  }>
	| undefined

export type ProductGroupQueryFilters =
	| Partial<{
			name: string
			archived: boolean
			categoryId: EntityId
	  }>
	| undefined

export type ProductGroupSortableFields = "name" | "createdAt"

export class ProductGroupQueryDao extends BaseQueryDao {
	constructor(knex: Knex) {
		super(knex, "product_group")
	}

	private readonly groupSortFieldMap: Record<
		ProductGroupSortableFields,
		string
	> = {
		name: "product_group.name",
		createdAt: "product_group.created_at",
	}

	async count(): Promise<number> {
		const result = await this.knex(this.tableName)
			.count<{ count: string }[]>("id as count")
			.whereNull("deleted_at")
		return Number(result[0].count)
	}
	async query(
		pagination: Pagination,
		filters: ProductGroupQueryFilters,
		include: ProductGroupQueryInclude,
		sort: Sort<ProductGroupSortableFields>,
	) {
		const builder = this.knex<ProductGroupDatabaseTable>(
			this.tableName,
		).select("*")
		if (pagination) {
			if (pagination.limit) {
				builder.limit(pagination.limit)
			}
			if (pagination.offset) {
				builder.offset(pagination.offset)
			}
		} else {
			builder.limit(defaultPagination.limit)
			builder.offset(defaultPagination.offset)
		}

		if (filters && filters.archived) {
			builder.whereNotNull("deleted_at")
		} else {
			builder.whereNull("deleted_at")
		}

		if (filters) {
			if (filters.name) {
				builder
					.whereRaw("(name % ? OR name ILIKE ?)", [
						filters.name,
						`%${filters.name}%`,
					])
					.orderByRaw("similarity(name, ?) DESC", [filters.name])
			}
			if (filters.categoryId) {
				builder.where("product_category_id", "=", filters.categoryId)
			}
		}

		if (sort) {
			sortQuery<ProductGroupSortableFields>(
				builder,
				sort,
				this.groupSortFieldMap,
			)
		} else {
			sortQuery<ProductGroupSortableFields>(
				builder,
				["name"],
				this.groupSortFieldMap,
			)
		}
		const rows = await builder
		let productInclude: ProductQueryInclude = {}
		if (include) {
			if (include.productSales) {
				productInclude.sales = true
			}
			if (include.productSettings) {
				productInclude.settings = true
			}
		}
		let groups: ProductGroupQueryDto[] = []
		for (const row of rows) {
			const isArchived = row.deleted_at !== null
			const productQueryDao = new ProductQueryDao(this.knex)
			const products = await productQueryDao.query(
				undefined,
				{ groupId: row.id, archived: isArchived },
				productInclude,
				undefined,
			)
			groups.push(this.mapToQueryDto(row, products))
		}
		return groups
	}

	async queryById(
		id: EntityId,
		include: ProductGroupQueryInclude,
	): Promise<ProductGroupQueryDto | null> {
		const builder = this.knex<ProductGroupDatabaseTable>(this.tableName)
			.select("*")
			.where("id", "=", id)
			.first()
		const row = await builder
		if (!row) {
			return null
		}
		let products: ProductQueryDto[] | undefined = undefined
		const productQueryDao = new ProductQueryDao(this.knex)
		let productInclude: ProductQueryInclude = {}
		if (include) {
			if (include.productSales) {
				productInclude.sales = true
			}
			if (include.productSettings) {
				productInclude.settings = true
			}
		}
		const isArchived = row.deleted_at !== null
		products = await productQueryDao.query(
			undefined,
			{ groupId: row.id, archived: isArchived },
			productInclude,
			undefined,
		)

		return this.mapToQueryDto(row, products)
	}

	async queryByName(
		name: ProductName,
		include: ProductGroupQueryInclude,
	): Promise<ProductGroupQueryDto | null> {
		const builder = this.knex<ProductGroupDatabaseTable>(this.tableName)
			.select("*")
			.where("name", "=", name.value)
			.first()

		const row = await builder
		if (!row) {
			return null
		}
		let products: ProductQueryDto[] | undefined = undefined
		const productQueryDao = new ProductQueryDao(this.knex)
		let productInclude: ProductQueryInclude = {}
		if (include) {
			if (include.productSales) {
				productInclude.sales = true
			}
			if (include.productSettings) {
				productInclude.settings = true
			}
		}
		const isArchived = row.deleted_at !== null
		products = await productQueryDao.query(
			undefined,
			{ groupId: row.id, archived: isArchived },
			productInclude,
			undefined,
		)

		return this.mapToQueryDto(row, products)
	}

	mapToQueryDto(
		row: ProductGroupDatabaseTable,
		products: ProductQueryDto[],
	): ProductGroupQueryDto {
		return {
			id: row.id,
			accountId: row.account_id,
			categoryId: row.product_category_id,
			name: row.name,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
			deletedAt: row.deleted_at,
			products: products,
		}
	}
}
