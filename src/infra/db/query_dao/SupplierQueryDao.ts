import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { SupplierDatabaseTable } from "../types/tables/SupplierDatabaseTable.js"
import { defaultPagination, Pagination } from "../types/queries/Pagination.js"
import { Sort, sortQuery } from "../utils/Sort.js"

export type SuppliedProductJoinedTable = {
	product_name: string
	product_id: EntityId
	product_min_orderable: number
	product_max_orderable: number
}

export type SuppliedProductQueryDto = {
	id: EntityId
	minOrderable: number
	maxOrderable: number
	name: string
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
			archived: boolean
	  }>
	| undefined

export type SupplierSortableFields = "name" | "leadTime"

export class SupplierQueryDao {
	private tableName = "supplier"
	private readonly supplierSortFieldMap: Record<
		SupplierSortableFields,
		string
	> = {
		name: "s.name",
		leadTime: "s.lead_time",
	}

	constructor(private readonly knex: Knex) {}

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
		if (filter) {
			if (filter.name) {
				builder.where("s.name", "%", filter.name)
			}
			if (filter.archived) {
				builder.whereNotNull("s.deleted_at")
			} else {
				builder.whereNull("s.deleted_at")
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
			builder.offset(defaultPagination.limit)
		}

		if (sort) {
			sortQuery(builder, sort, this.supplierSortFieldMap)
		} else {
			sortQuery(builder, ["name"], this.supplierSortFieldMap)
		}
		console.log(builder.toQuery())

		const rows = await builder
		let suppliers: SupplierQueryDto[] = []
		for (const row of rows) {
			if (include && include.products) {
				const results = await this.knex<{
					min_orderable: number
					max_orderable: number
					name: string
					id: EntityId
				}>("product_supplier as ps")
					.join("product_supplier as ps", "ps.supplier_id", "s.id")
					.join("product as p", "p.id", "ps.product_id")
					.select(
						"p.id as product_id",
						"p.name as product_name",
						"ps.min_orderable as product_min_orderable",
						"ps.max_orderable as product_max_orderable",
					)
				suppliers.push(this.mapToQueryDTO(row, results))
			}
		}
		return suppliers
	}

	async queryById(
		id: EntityId,
		archived: boolean | undefined,
		include: SupplierQueryInclude,
	) {
		const builder = this.knex<
			SupplierDatabaseTable & SuppliedProductJoinedTable
		>(`${this.tableName} as s`)
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
		if (archived) {
			builder.whereNotNull("s.deleted_at")
		} else {
			builder.whereNull("s.deleted_at")
		}
		if (include) {
			if (include.products) {
				builder.join("product_supplier as ps", "ps.supplier_id", "s.id")
				builder.join("product as p", "p.id", "ps.product_id")
				builder.select(
					"p.id as product_id",
					"p.name as product_name",
					"ps.min_orderable as product_min_orderable",
					"ps.max_orderable as product_max_orderable",
				)
			}
		}
		const rows = await builder
		return include?.products
			? this.groupWithProducts(rows)
			: rows.map((row) => ({
					id: row.id,
					accountId: row.account_id,
					createdAt: row.created_at,
					deletedAt: row.deleted_at,
					leadTime: row.lead_time,
					name: row.name,
					updatedAt: row.updated_at,
				}))
	}

	private groupWithProducts(
		rows: (SupplierDatabaseTable & SuppliedProductJoinedTable)[],
	): SupplierQueryDto[] {
		const supplierMap = new Map<EntityId, SupplierQueryDto>()
		for (const row of rows) {
			let supplier = supplierMap.get(row.id)

			if (!supplier) {
				supplier = {
					id: row.id,
					accountId: row.account_id,
					createdAt: row.created_at,
					deletedAt: row.deleted_at,
					leadTime: row.lead_time,
					name: row.name,
					updatedAt: row.updated_at,
					products: [],
				}
				supplierMap.set(row.id, supplier)
			}

			supplier.products!.push({
				id: row.product_id,
				maxOrderable: row.product_max_orderable,
				minOrderable: row.product_min_orderable,
				name: row.product_name,
			})
		}
		return Array.from(supplierMap.values())
	}

	private mapToQueryDTO(
		row: SupplierDatabaseTable,
		products:
			| {
					id: EntityId
					name: string
					min_orderable: number
					max_orderable: number
			  }[]
			| undefined,
	): SupplierQueryDto {
		let formattedProducts: SuppliedProductQueryDto[] | undefined = undefined
		if (products) {
			formattedProducts = products.map((product) => {
				return {
					id: product.id,
					maxOrderable: product.max_orderable,
					minOrderable: product.min_orderable,
					name: product.name,
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
