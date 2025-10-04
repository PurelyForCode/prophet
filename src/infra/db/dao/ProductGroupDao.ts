import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { ProductName } from "../../../domain/product_management/entities/product/value_objects/ProductName.js"
import { ProductGroupDatabaseTable } from "../types/tables/ProductGroupDatabaseTable.js"

export type ProductGroupDto = {
	id: EntityId
	productCategoryId: EntityId | null
	accountId: EntityId
	name: string
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
}

export class ProductGroupDao {
	private tableName = "product_group"
	constructor(private readonly knex: Knex) {}
	async insert(input: ProductGroupDatabaseTable) {
		await this.knex<ProductGroupDatabaseTable>(this.tableName).insert(input)
	}
	async update(input: ProductGroupDatabaseTable) {
		await this.knex<ProductGroupDatabaseTable>(this.tableName)
			.update(input)
			.where({ id: input.id })
	}
	async delete(input: ProductGroupDatabaseTable) {
		await this.knex<ProductGroupDatabaseTable>(this.tableName)
			.delete()
			.where({ id: input.id })
	}

	async findById(id: EntityId): Promise<ProductGroupDto | null> {
		const result = await this.knex<ProductGroupDatabaseTable>(
			this.tableName,
		)
			.select("*")
			.where("id", "=", id)
			.first()
		if (!result) {
			return null
		} else {
			return this.mapToDto(result)
		}
	}
	async findByName(name: ProductName): Promise<ProductGroupDto | null> {
		const result = await this.knex<ProductGroupDatabaseTable>(
			this.tableName,
		)
			.select("*")
			.where("name", "=", name.value)
			.first()
		if (!result) {
			return null
		} else {
			return this.mapToDto(result)
		}
	}
	async isNameUnique(name: ProductName): Promise<boolean> {
		const result = await this.knex<ProductGroupDatabaseTable>(
			this.tableName,
		)
			.select("*")
			.where("name", "=", name.value)
			.first()
		if (!result) {
			return true
		} else {
			return false
		}
	}

	mapToDto(row: ProductGroupDatabaseTable): ProductGroupDto {
		return {
			createdAt: row.created_at,
			deletedAt: row.deleted_at,
			accountId: row.account_id,
			id: row.id,
			name: row.name,
			productCategoryId: row.product_category_id,
			updatedAt: row.updated_at,
		}
	}
}
