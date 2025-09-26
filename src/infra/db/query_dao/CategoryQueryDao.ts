import { Knex } from "knex";
import { EntityId } from "../../../core/types/EntityId.js";
import { CategoryDatabaseTable } from "../types/tables/CategoryDatabaseTable.js";
import { Pagination } from "../types/queries/Pagination.js";
import { ProductQueryDao, ProductQueryDto } from "./ProductQueryDao.js";
import { QuerySort } from "../types/queries/QuerySort.js";

export type CategoryInclude = Partial<{ products: boolean }> | undefined;

export type CategoryFilters = Partial<{ name: string, archived: boolean }> | undefined;

type CategorySortFields = "name"

export type CategoryQuerySort = QuerySort<CategorySortFields>

export type CategoryQueryDto = {
	id: EntityId;
	accountId: EntityId;
	name: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
	products: undefined | ProductQueryDto[]
}

export class CategoryQueryDao {
	private tableName = "product_category";
	private readonly categorySortFieldMap: Record<CategorySortFields, string> = {
		name: "c.name"

	}

	constructor(private readonly knex: Knex) { }

	async query(pagination: Pagination, filters: CategoryFilters, include: CategoryInclude) {
		const builder = this.knex<CategoryDatabaseTable>(`${this.tableName} as c`).select("c.*")

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
		const rows = await builder
		let categories: CategoryQueryDto[] = []
		for (const row of rows) {
			let products: ProductQueryDto[] | undefined = undefined
			if (include && include.products === true) {
				const productDao = new ProductQueryDao(this.knex)
				const productRows = await productDao.query(undefined, { categoryId: row.id }, undefined, ["name:desc"])
			}
			this.mapToQueryDto(row, products)
			return categories
		}
	}


	async queryById(id: EntityId, archived: boolean | undefined, include: CategoryInclude) {
		const builder = this.knex<CategoryDatabaseTable>(this.tableName).select("*").where("id", "=", id).first()
		if (archived === true) {
			builder.whereNotNull("deleted_at")
		} else {
			builder.whereNull("deleted_at")
		}
		const row = await builder
		if (!row) {
			return null
		}
		let products: ProductQueryDto[] = []
		if (include && include.products === true) {
			const productDao = new ProductQueryDao(this.knex)
			const productRows = await productDao.query(undefined, { categoryId: row.id }, undefined)
		}
		return this.mapToQueryDto(row, products)
	}

	private mapToQueryDto(row: CategoryDatabaseTable, products: undefined | ProductQueryDto[]): CategoryQueryDto {
		return {
			id: row.id,
			accountId: row.account_id,
			name: row.name,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
			deletedAt: row.deleted_at,
			products: products

		}
	}
}

