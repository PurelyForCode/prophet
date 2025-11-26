import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { SuppliedProductDatabaseTable } from "../types/tables/SuppliedProductDatabaseTable.js"

export type SuppliedProductDTO = {
	id: EntityId
	productId: EntityId
	supplierId: EntityId
	min: number
	max: number
	isDefault: boolean
}

export class SuppliedProductDAO {
	private tableName = "product_supplier"
	constructor(private readonly knex: Knex) {}

	async isProductSupplied(
		productId: EntityId,
		supplierId: EntityId,
	): Promise<boolean> {
		const row = await this.knex<SuppliedProductDatabaseTable>(
			this.tableName,
		)
			.select("*")
			.where("supplier_id", supplierId)
			.where("product_id", productId)
			.first()
		return row !== undefined
	}

	async doesProductHaveDefaultSupplier(productId: EntityId) {
		const defaultSupplier = await this.knex<SuppliedProductDatabaseTable>(
			this.tableName,
		)
			.select("id")
			.where("product_id", "=", productId)
			.where("is_default", true)
			.first()
		return defaultSupplier ? true : false
	}

	async insert(table: SuppliedProductDatabaseTable) {
		await this.knex<SuppliedProductDatabaseTable>(this.tableName).insert(
			table,
		)
	}

	async delete(id: EntityId) {
		await this.knex(this.tableName).delete().where({ id: id })
	}

	async update(table: SuppliedProductDatabaseTable) {
		await this.knex<SuppliedProductDatabaseTable>(this.tableName)
			.update(table)
			.where({ id: table.id })
	}

	async findById(id: EntityId): Promise<SuppliedProductDTO | null> {
		const row = await this.knex<SuppliedProductDatabaseTable>(
			this.tableName,
		)
			.select("*")
			.where({ id: id })
			.first()
		if (!row) {
			return null
		} else {
			return this.mapToDTO(row)
		}
	}

	async findAllBySupplierId(
		supplierId: EntityId,
	): Promise<SuppliedProductDTO[]> {
		const rows = await this.knex<SuppliedProductDatabaseTable>(
			this.tableName,
		)
			.select("*")
			.where({ supplier_id: supplierId })
		const suppliers = []
		for (const row of rows) {
			suppliers.push(this.mapToDTO(row))
		}
		return suppliers
	}

	private mapToDTO(row: SuppliedProductDatabaseTable): SuppliedProductDTO {
		return {
			id: row.id,
			max: row.max_orderable,
			min: row.min_orderable,
			productId: row.product_id,
			supplierId: row.supplier_id,
			isDefault: row.is_default,
		}
	}
}
