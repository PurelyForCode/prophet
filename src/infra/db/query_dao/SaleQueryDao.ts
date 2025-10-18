import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { SaleDatabaseTable } from "../types/tables/SaleDatabaseTable.js"
import { defaultPagination, Pagination } from "../types/queries/Pagination.js"
import { Sort, sortQuery } from "../utils/Sort.js"
import { BaseQueryDao } from "./BaseQueryDao.js"

export type SaleQueryFilter = Partial<{
	productId: EntityId
	archived: boolean
	date: Date
}>

export type SaleSortableField = "quantity" | "status" | "date"

export type SaleQueryDto = {
	id: string
	accountId: string
	productId: string
	quantity: number
	status: string
	date: Date
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
}

export class SaleQueryDao extends BaseQueryDao {
	constructor(knex: Knex) {
		super(knex, "sale")
	}

	private readonly saleSortFieldMap: Record<SaleSortableField, string> = {
		date: "s.date",
		quantity: "s.quantity",
		status: "s.status",
	}

	async query(
		pagination: Pagination,
		filters: SaleQueryFilter | undefined,
		sort: Sort<SaleSortableField>,
	): Promise<SaleQueryDto[]> {
		const builder = this.knex<SaleDatabaseTable>(
			`${this.tableName} as s`,
		).select("s.*")

		if (filters && filters.archived) {
			builder.whereNotNull("s.deleted_at")
		} else {
			builder.whereNull("s.deleted_at")
		}

		if (filters) {
			if (filters.productId) {
				builder.where("s.product_id", "=", filters.productId)
			}
			if (filters.date) {
				builder.where("s.date", "=", filters.date)
			}
		}

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

		if (sort) {
			sortQuery(builder, sort, this.saleSortFieldMap)
		} else {
			sortQuery(builder, ["-date"], this.saleSortFieldMap)
		}

		const rows = await builder
		const sales: SaleQueryDto[] = []
		for (const row of rows) {
			sales.push(this.mapToQueryDTO(row))
		}
		return sales
	}

	async queryById(
		id: EntityId,
		filters: SaleQueryFilter | undefined,
	): Promise<SaleQueryDto | null> {
		const builder = this.knex<SaleDatabaseTable>(`${this.tableName} as s`)
			.select("s.*")
			.where("s.id", "=", id)
			.first()

		if (filters) {
			if (filters.productId) {
				builder.where("s.product_id", "=", filters.productId)
			}
		}

		const row = await builder
		if (row) {
			return this.mapToQueryDTO(row)
		} else {
			return null
		}
	}

	mapToQueryDTO(row: SaleDatabaseTable): SaleQueryDto {
		return {
			id: row.id,
			accountId: row.account_id,
			productId: row.product_id,
			quantity: row.quantity,
			status: row.status,
			date: row.date,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
			deletedAt: row.deleted_at,
		}
	}
}
