import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { SupplierDatabaseTable } from "../types/tables/SupplierDatabaseTable.js"
import { defaultPagination, Pagination } from "../types/queries/Pagination.js"
import { Sort, sortQuery } from "../utils/Sort.js"
import { BaseQueryDao } from "./BaseQueryDao.js"

export type SuppliedProductJoinedTable = {
	product_name: string
	product_id: EntityId
	product_min_orderable: number
	product_max_orderable: number
	product_is_default: boolean
}

export type SuppliedProductQueryDto = {
	id: EntityId
	name: string
	minOrderable: number
	maxOrderable: number
	isDefault: boolean
}

export type SupplierQueryDto = {
	id: EntityId
	accountId: EntityId
	name: string
	leadTime: number
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
	products: SuppliedProductQueryDto[] | undefined
}

export type SupplierIncludeFields = "products"

export type SupplierQueryInclude =
	| Partial<{
			products: boolean
	  }>
	| undefined

export type SupplierQueryFilter =
	| Partial<{
			name: string
			productId: EntityId
			archived: boolean
	  }>
	| undefined

export type SupplierSortableFields = "name" | "leadTime"

export class SupplierQueryDao extends BaseQueryDao {
	constructor(knex: Knex) {
		super(knex, "supplier")
	}

	private readonly supplierSortFieldMap: Record<
		SupplierSortableFields,
		string
	> = {
		name: "s.name",
		leadTime: "s.lead_time",
	}

	async query(
		pagination: Pagination,
		filter: SupplierQueryFilter,
		sort: Sort<SupplierSortableFields>,
		include: SupplierQueryInclude,
	) {
		const builder = this.knex<
			SupplierDatabaseTable & SuppliedProductJoinedTable
		>(`${this.tableName} as s`).select(
			"s.id",
			"s.account_id",
			"s.name",
			"s.lead_time",
			"s.created_at",
			"s.updated_at",
			"s.deleted_at",
		)

		if (filter && filter.archived) {
			builder.whereNotNull("s.deleted_at")
		} else {
			builder.whereNull("s.deleted_at")
		}

		if (filter) {
			if (filter.name) {
				builder.where("s.name", "%", filter.name)
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
			sortQuery(builder, sort, this.supplierSortFieldMap)
		} else {
			sortQuery(builder, ["name"], this.supplierSortFieldMap)
		}
		const rows = await builder
		let suppliers: SupplierQueryDto[] = []
		for (const row of rows) {
			let products = undefined
			if (include && include.products) {
				products = await this.knex<{
					min_orderable: number
					max_orderable: number
					name: string
					id: EntityId
				}>("product_supplier as ps")
					.join("product as p", "p.id", "ps.product_id")
					.select(
						"p.id as id",
						"p.name as name",
						"ps.min_orderable as min_orderable",
						"ps.max_orderable as max_orderable",
						"ps.is_default as is_default",
					)
					.where("ps.supplier_id", "=", row.id)
					.whereNull("p.deleted_at")
			}
			suppliers.push(this.mapToQueryDTO(row, products))
		}
		return suppliers
	}

	async queryById(id: EntityId, include: SupplierQueryInclude) {
		const supplierRow = await this.knex<SupplierDatabaseTable>(
			`${this.tableName} as s`,
		)
			.select(
				"s.id",
				"s.account_id",
				"s.name",
				"s.lead_time",
				"s.created_at",
				"s.updated_at",
				"s.deleted_at",
			)
			.where("s.id", "=", id)
			.first()

		if (!supplierRow) return null

		let products: {
			id: EntityId
			name: string
			min_orderable: number
			max_orderable: number
			is_default: boolean
		}[] = []
		if (include?.products) {
			const productRows = await this.knex("product_supplier as ps")
				.join("product as p", "p.id", "ps.product_id")
				.select(
					"p.id as id",
					"p.name as name",
					"ps.min_orderable as min_orderable",
					"ps.max_orderable as max_orderable",
					"ps.is_default as is_default",
				)
				.where("ps.supplier_id", "=", id)
				.whereNull("p.deleted_at")

			if (productRows.length > 0) {
				products = productRows.map((p) => ({
					id: p.id,
					name: p.name,
					min_orderable: p.min_orderable,
					max_orderable: p.max_orderable,
					is_default: p.is_default,
				}))
			}
		}

		return this.mapToQueryDTO(supplierRow, products)
	}

	private mapToQueryDTO(
		row: SupplierDatabaseTable,
		products:
			| {
					id: EntityId
					name: string
					min_orderable: number
					max_orderable: number
					is_default: boolean
			  }[]
			| undefined,
	): SupplierQueryDto {
		let formattedProducts: SuppliedProductQueryDto[] | undefined = undefined
		if (products) {
			formattedProducts = products.map((product) => {
				return {
					id: product.id,
					name: product.name,
					maxOrderable: product.max_orderable,
					minOrderable: product.min_orderable,
					isDefault: product.is_default,
				}
			})
		}
		return {
			id: row.id,
			accountId: row.account_id,
			name: row.name,
			leadTime: row.lead_time,
			createdAt: row.created_at,
			deletedAt: row.deleted_at,
			updatedAt: row.updated_at,
			products: formattedProducts,
		}
	}
}
