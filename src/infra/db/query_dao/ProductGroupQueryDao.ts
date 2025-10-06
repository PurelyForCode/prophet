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

export type ProductGroupQueryDto = {
	id: EntityId
	productCategoryId: EntityId | null
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

export class ProductGroupQueryDao {
	private tableName = "product_group"
	private readonly groupSortFieldMap: Record<
		ProductGroupSortableFields,
		string
	> = {
		name: "product_group.name",
		createdAt: "product_group.created_at",
	}

	constructor(private readonly knex: Knex) {}

	async exists(id: EntityId): Promise<boolean> {
		const row = await this.knex(this.tableName)
			.select("*")
			.where("id", "=", id)
			.first()
		return !!row
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
				builder.where("name", "=", filters.name)
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
		console.log(builder.toQuery())
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
			const productQueryDao = new ProductQueryDao(this.knex)
			let archived = undefined
			if (filters) {
				if (filters.archived) {
					archived = true
				} else {
					archived = false
				}
			}

			const products = await productQueryDao.query(
				undefined,
				{ groupId: row.id, archived },
				productInclude,
				undefined,
			)
			groups.push(this.mapToQueryDto(row, products))
		}
		return groups
	}

	async queryById(
		id: EntityId,
		archived: boolean | undefined,
		include: ProductGroupQueryInclude,
	): Promise<ProductGroupQueryDto | null> {
		const builder = this.knex<ProductGroupDatabaseTable>(this.tableName)
			.select("*")
			.where("id", "=", id)
			.first()
		if (archived) {
			builder.whereNotNull("deleted_at")
		} else {
			builder.whereNull("deleted_at")
		}
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
		products = await productQueryDao.query(
			undefined,
			{ groupId: row.id },
			productInclude,
			undefined,
		)

		return this.mapToQueryDto(row, products)
	}

	async queryByName(
		name: ProductName,
		archived: boolean | undefined,
		include: ProductGroupQueryInclude,
	): Promise<ProductGroupQueryDto | null> {
		const builder = this.knex<ProductGroupDatabaseTable>(this.tableName)
			.select("*")
			.where("name", "=", name.value)
			.first()

		if (archived) {
			builder.whereNotNull("deleted_at")
		} else {
			builder.whereNull("deleted_at")
		}
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
		products = await productQueryDao.query(
			undefined,
			{ groupId: row.id },
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
			accountId: row.account_id,
			createdAt: row.created_at,
			deletedAt: row.deleted_at,
			id: row.id,
			name: row.name,
			productCategoryId: row.product_category_id,
			updatedAt: row.updated_at,
			products: products,
		}
	}
}
