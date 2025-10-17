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
import { InventoryRecommendationDatabaseTable } from "../types/tables/InventoryRecommendationTable.js"

export type InventoryRecommendationQueryInclude = Partial<{}> | undefined
export type InventoryRecommendationIncludeField = "groups"
export type InventoryRecommendationFilters =
	| Partial<{
			status: string
			supplierId: EntityId
	  }>
	| undefined
export type InventoryRecommendationSortableFields = "status"

export type InventoryRecommendationQueryDto = {
	productId: EntityId
	supplierId: EntityId
	status: string
	reorderAmount: number
	reorderAt: Date
	runsOutAt: Date
	coverageDays: number
}

export class InventoryRecommendationQueryDao extends BaseQueryDao {
	constructor(knex: Knex) {
		super(knex, "inventory_recommendation")
	}

	private readonly inventoryRecommendationSortFieldMap: Record<
		InventoryRecommendationSortableFields,
		string
	> = {
		status: "status",
	}

	async query(
		pagination: Pagination,
		filters: InventoryRecommendationFilters,
		include: InventoryRecommendationQueryInclude,
		sort: Sort<InventoryRecommendationSortableFields>,
	) {
		const builder = this.knex<InventoryRecommendationDatabaseTable>(
			`${this.tableName} as i`,
		).select("i.*")

		if (pagination) {
			if (pagination.limit) {
				builder.limit(pagination.limit)
			}
			if (pagination.offset) {
				builder.limit(pagination.offset)
			}
		} else {
			builder.limit(defaultPagination.limit)
			builder.offset(defaultPagination.offset)
		}

		if (filters && filters.archived === true) {
			builder.whereNotNull("c.deleted_at")
		} else {
			builder.whereNull("c.deleted_at")
		}

		if (filters) {
			if (filters.name) {
				builder.where("c.name", "%", filters.name)
			}
		}

		sortQuery(builder, sort, this.inventoryRecommendationSortFieldMap)

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
