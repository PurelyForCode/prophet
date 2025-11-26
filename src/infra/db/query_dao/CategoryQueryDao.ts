import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { CategoryDatabaseTable } from "../types/tables/CategoryDatabaseTable.js"
import { defaultPagination, Pagination } from "../types/queries/Pagination.js"
import {
	ProductGroupQueryDao,
	ProductGroupQueryDto,
} from "./ProductGroupQueryDao.js"
import { Sort, sortQuery } from "../utils/Sort.js"
import { BaseQueryDao } from "./BaseQueryDao.js"

export type ProductGroupQueryInclude =
	| Partial<{
			productSales: boolean
			productSettings: boolean
	  }>
	| undefined

export type CategoryIncludeField = "groups"
export type CategoryQueryInclude =
	| Partial<{
			groups: boolean
	  }>
	| undefined

export type CategoryFilters =
	| Partial<{ name: string; archived: boolean }>
	| undefined

export type CategoryQueryDto = {
	id: EntityId
	accountId: EntityId
	name: string
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
	productGroups: undefined | ProductGroupQueryDto[]
}

export type CategorySortableFields = "name"

export class CategoryQueryDao extends BaseQueryDao {
	constructor(knex: Knex) {
		super(knex, "product_category")
	}

	private readonly categorySortFieldMap: Record<
		CategorySortableFields,
		string
	> = {
		name: "c.name",
	}

	async query(
		pagination: Pagination,
		filters: CategoryFilters,
		include: CategoryQueryInclude,
		sort: Sort<CategorySortableFields>,
	) {
		const builder = this.knex<CategoryDatabaseTable>(
			`${this.tableName} as c`,
		).select("c.*")

		if (filters?.archived) {
			builder.whereNotNull("c.deleted_at")
		} else {
			builder.whereNull("c.deleted_at")
		}

		if (pagination) {
			if (pagination.limit) {
				builder.limit(pagination.limit)
			} else {
				builder.limit(defaultPagination.limit)
			}
			if (pagination.offset) {
				builder.offset(pagination.offset)
			} else {
				builder.offset(defaultPagination.offset)
			}
		} else {
			builder.limit(defaultPagination.limit)
			builder.offset(defaultPagination.offset)
		}

		if (filters) {
			if (filters.name) {
				builder
					.whereRaw("(c.name % ? OR c.name ILIKE ?)", [
						filters.name,
						`%${filters.name}%`,
					])
					.orderByRaw("similarity(c.name, ?) DESC", [filters.name])
			}
		}

		if (sort) {
			sortQuery(builder, sort, this.categorySortFieldMap)
		} else {
			sortQuery(builder, ["name"], this.categorySortFieldMap)
		}

		const rows = await builder
		let categories: CategoryQueryDto[] = []
		for (const row of rows) {
			let groups: ProductGroupQueryDto[] | undefined = undefined
			if (include) {
				if (include.groups) {
					const groupQueryDao = new ProductGroupQueryDao(this.knex)
					groups = await groupQueryDao.query(
						undefined,
						{ categoryId: row.id },
						undefined,
						[],
					)
				}
			}
			categories.push(this.mapToQueryDto(row, groups))
		}
		return categories
	}

	async queryById(id: EntityId, include: CategoryQueryInclude) {
		const builder = this.knex<CategoryDatabaseTable>(this.tableName)
			.select("*")
			.where("id", "=", id)
			.first()
		const row = await builder
		if (!row) {
			return null
		}
		let groups: ProductGroupQueryDto[] = []
		if (include) {
			const isArchived = row.deleted_at !== null
			if (include.groups) {
				const groupQueryDao = new ProductGroupQueryDao(this.knex)
				groups = await groupQueryDao.query(
					undefined,
					{ categoryId: row.id, archived: isArchived },
					undefined,
					[],
				)
			}
		}
		return this.mapToQueryDto(row, groups)
	}

	private mapToQueryDto(
		row: CategoryDatabaseTable,
		products: undefined | ProductGroupQueryDto[],
	): CategoryQueryDto {
		return {
			id: row.id,
			accountId: row.account_id,
			name: row.name,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
			deletedAt: row.deleted_at,
			productGroups: products,
		}
	}
}
