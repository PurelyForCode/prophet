import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { CategoryDatabaseTable } from "../types/tables/CategoryDatabaseTable.js"
import { Pagination } from "../types/queries/Pagination.js"
import {
	ProductGroupQueryDao,
	ProductGroupQueryDto,
} from "./ProductGroupQueryDao.js"
import { Sort, sortQuery } from "../utils/Sort.js"

export type CategoryInclude = Array<"groups"> | undefined

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

type CategorySortableFields = "name"

export class CategoryQueryDao {
	private tableName = "product_category"
	private readonly categorySortFieldMap: Record<
		CategorySortableFields,
		string
	> = {
		name: "c.name",
	}

	constructor(private readonly knex: Knex) {}

	async query(
		pagination: Pagination,
		filters: CategoryFilters,
		include: CategoryInclude,
		sort: Sort<CategorySortableFields>,
	) {
		const builder = this.knex<CategoryDatabaseTable>(
			`${this.tableName} as c`,
		).select("c.*")

		if (pagination) {
			if (pagination.limit) {
				builder.limit(pagination.limit)
			}
			if (pagination.offset) {
				builder.limit(pagination.offset)
			}
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
		sortQuery(builder, sort, this.categorySortFieldMap)

		const rows = await builder
		let categories: CategoryQueryDto[] = []
		for (const row of rows) {
			let groups: ProductGroupQueryDto[] | undefined = undefined
			if (include) {
				for (const field of include) {
					if (field === "groups") {
						const groupQueryDao = new ProductGroupQueryDao(
							this.knex,
						)
						groups = await groupQueryDao.query(
							undefined,
							{ categoryId: row.id },
							undefined,
							[],
						)
					}
				}
			}
			categories.push(this.mapToQueryDto(row, groups))
		}
		return categories
	}

	async queryById(
		id: EntityId,
		archived: boolean | undefined,
		include: CategoryInclude,
	) {
		const builder = this.knex<CategoryDatabaseTable>(this.tableName)
			.select("*")
			.where("id", "=", id)
			.first()
		if (archived === true) {
			builder.whereNotNull("deleted_at")
		} else {
			builder.whereNull("deleted_at")
		}
		const row = await builder
		if (!row) {
			return null
		}
		let groups: ProductGroupQueryDto[] = []
		if (include) {
			for (const field of include) {
				if (field === "groups") {
					const groupQueryDao = new ProductGroupQueryDao(this.knex)
					groups = await groupQueryDao.query(
						undefined,
						{ categoryId: row.id },
						undefined,
						[],
					)
				}
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
