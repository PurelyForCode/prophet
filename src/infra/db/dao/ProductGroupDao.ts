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

	async findByCategoryId(
		categoryId: EntityId,
	): Promise<Map<EntityId, ProductGroupDto>> {
		const result = await this.knex<ProductGroupDatabaseTable>(
			this.tableName,
		)
			.select("*")
			.where("product_category_id", "=", categoryId)
		let group = new Map<EntityId, ProductGroupDto>()
		for (const row of result) {
			group.set(row.id, this.mapToDto(row))
		}
		return group
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

	/**
	 *
	 * @param name
	 * if archived is undefined, searches through everythign
	 * @param archived
	 * @returns
	 */
	async isNameUnique(
		name: ProductName,
		archived: boolean | undefined,
	): Promise<boolean> {
		const builder = this.knex<ProductGroupDatabaseTable>(this.tableName)
			.select("id")
			.where("name", "=", name.value)
			.first()

		if (archived === true) {
			builder.whereNotNull("deleted_at")
		} else if (archived === false) {
			builder.whereNull("deleted_at")
		}
		const result = await builder

		if (!result) {
			return true
		} else {
			return false
		}
	}

	async exists(id: EntityId): Promise<boolean> {
		const result = await this.knex(this.tableName)
			.where("id", "=", id)
			.first()
		return !!result
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
