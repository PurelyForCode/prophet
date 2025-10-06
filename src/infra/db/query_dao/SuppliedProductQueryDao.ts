import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { SuppliedProductDatabaseTable } from "../types/tables/SuppliedProductDatabaseTable.js"

export type SuppliedProductDto = {
	id: EntityId
	productId: EntityId
	supplierId: EntityId
	min: number
	max: number
}

export type SuppliedProductQueryDto = {
	id: EntityId
	productId: EntityId
	supplierId: EntityId
	min: number
	max: number
}

export class SuppliedProductDao {
	private tableName = "product_supplier"
	constructor(private readonly knex: Knex) {}

	async query(
		filters: Partial<{
			supplierId: EntityId
		}>,
	): Promise<SuppliedProductDto[]> {
		const builder = this.knex<SuppliedProductDatabaseTable>(
			`${this.tableName} as sp`,
		).select("sp.*")
		if (filters) {
			if (filters.supplierId) {
				builder.where("sp.supplier_id", "=", filters.supplierId)
			}
		}
		const rows = await builder
		const suppliers = []
		for (const row of rows) {
			suppliers.push(this.mapToQueryDTO(row))
		}
		return suppliers
	}

	private mapToQueryDTO(
		row: SuppliedProductDatabaseTable,
	): SuppliedProductQueryDto {
		return {
			id: row.id,
			max: row.max_orderable,
			min: row.min_orderable,
			productId: row.product_id,
			supplierId: row.supplier_id,
		}
	}
}
