import { Knex } from "knex";
import { EntityId } from "../../../core/types/EntityId.js";
import { SupplierDatabaseTable } from "../types/tables/SupplierDatabaseTable.js";
import { QuerySort } from "../types/queries/QuerySort.js";
import { applySort } from "../utils/applySort.js";
import { Pagination } from "../types/queries/Pagination.js";

export type SuppliedProductJoinedTable = {
	product_name: string
	product_id: EntityId
	product_min_orderable: number
	product_max_orderable: number
}

export type SuppliedProductQueryDto = {
	id: EntityId;
	minOrderable: number;
	maxOrderable: number;
	name: string;
}

export type SupplierQueryDto = {
	id: EntityId;
	accountId: EntityId;
	name: string;
	leadTime: number;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
	products: SuppliedProductQueryDto[] | undefined
};

export type SupplierQueryInclude = Partial<{
	products: boolean;
}> | undefined;

export type SupplierQueryFilter = Partial<{
	name: string;
	productId: EntityId;
}> | undefined;

export type SupplierSortFields = "name" | "leadTime"
export type SupplierQuerySort = QuerySort<SupplierSortFields> | undefined



export class SupplierQueryDao {
	private tableName = "supplier";
	private readonly supplierSortFieldMap: Record<SupplierSortFields, string> = {
		"name": "s.name",
		"leadTime": "s.lead_time"
	}

	constructor(private readonly knex: Knex) { }

	// always include products supplied by a supplier
	// NOTE: Since pagination is a thing, change it from a join query to a builder query
	async query(filter: SupplierQueryFilter, sort: SupplierQuerySort, include: SupplierQueryInclude) {
		const builder = this.knex<SupplierDatabaseTable & SuppliedProductJoinedTable>(`${this.tableName} as s`)
			.select(
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
			if (filter.productId) {
				builder.where("s.product_id", "=", filter.productId)
			}
		}


		if (include) {
			if (include.products) {
				builder.join("product_supplier as ps", "ps.supplier_id", "s.id")
				builder.join("product as p", "p.id", "ps.product_id")
				builder.select(
					"p.id as product_id",
					"p.name as product_name",
					"ps.min_orderable as product_min_orderable",
					"ps.max_orderable as product_max_orderable"
				)
			}
		}

		applySort(builder, sort, this.supplierSortFieldMap)
		const rows: (SupplierDatabaseTable & SuppliedProductJoinedTable)[] = await builder
		let supplierMap: Map<EntityId, SupplierQueryDto> = new Map()

		return include?.products ? this.groupWithProducts(rows) : rows.map(row => ({
			id: row.id,
			accountId: row.account_id,
			createdAt: row.created_at,
			deletedAt: row.deleted_at,
			leadTime: row.lead_time,
			name: row.name,
			updatedAt: row.updated_at,
		}))
	}

	async queryById(id: EntityId, include: SupplierQueryInclude) {
		const builder = this.knex<SupplierDatabaseTable & SuppliedProductJoinedTable>(`${this.tableName} as s`)
			.select(
				"s.id",
				"s.account_id",
				"s.name",
				"s.lead_time",
				"s.created_at",
				"s.updated_at",
				"s.deleted_at",
			).where("s.id", "=", id)
		if (include) {
			if (include.products) {
				builder.join("product_supplier as ps", "ps.supplier_id", "s.id")
				builder.join("product as p", "p.id", "ps.product_id")
				builder.select(
					"p.id as product_id",
					"p.name as product_name",
					"ps.min_orderable as product_min_orderable",
					"ps.max_orderable as product_max_orderable"
				)
			}
		}
		const rows = await builder
		return include?.products ? this.groupWithProducts(rows) : rows.map(row => ({
			id: row.id,
			accountId: row.account_id,
			createdAt: row.created_at,
			deletedAt: row.deleted_at,
			leadTime: row.lead_time,
			name: row.name,
			updatedAt: row.updated_at,
		}))
	}

	private groupWithProducts(rows: (SupplierDatabaseTable & SuppliedProductJoinedTable)[]): SupplierQueryDto[] {
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
		products: { product_id: EntityId, product_name: string, product_min_orderable: number, product_max_orderable: number }[] | undefined
	): SupplierQueryDto {
		let formattedProducts: SuppliedProductQueryDto[] | undefined = undefined
		if (products) {
			formattedProducts = products.map((product) => {
				return {
					id: product.product_id,
					maxOrderable: product.product_max_orderable,
					minOrderable: product.product_min_orderable,
					name: product.product_name
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
			products: formattedProducts
		};
	}
}
