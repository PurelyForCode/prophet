import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { DeliveryItemDatabaseTable } from "../types/tables/DeliveryItemDatabaseTable.js"

export type DeliveryItemDTO = {
	id: EntityId
	productId: EntityId
	deliveryId: EntityId
	quantity: number
}

export class DeliveryItemDAO {
	constructor(private readonly knex: Knex) {}
	private tableName = "delivery_item"

	async insert(table: DeliveryItemDatabaseTable) {
		await this.knex<DeliveryItemDatabaseTable>(this.tableName).insert({
			id: table.id,
			product_id: table.product_id,
			delivery_id: table.delivery_id,
			quantity: table.quantity,
		})
	}

	async delete(deliveryItemId: EntityId) {
		await this.knex(this.tableName).delete().where({ id: deliveryItemId })
	}

	async update(table: DeliveryItemDatabaseTable) {
		await this.knex<DeliveryItemDatabaseTable>(this.tableName)
			.update({
				delivery_id: table.delivery_id,
				id: table.id,
				product_id: table.product_id,
				quantity: table.quantity,
			})
			.where({ id: table.id })
	}

	async findById(id: EntityId): Promise<DeliveryItemDTO | null> {
		const row = await this.knex<DeliveryItemDatabaseTable>(this.tableName)
			.select("*")
			.where({ id: id })
			.first()
		if (!row) {
			return null
		} else {
			return this.mapToDTO(row)
		}
	}

	async findByDeliveryId(deliveryId: EntityId) {
		const rows = await this.knex<DeliveryItemDatabaseTable>(this.tableName)
			.select("*")
			.where({ delivery_id: deliveryId })

		const deliveryItems = []
		for (const row of rows) {
			deliveryItems.push(this.mapToDTO(row))
		}
		return deliveryItems
	}

	async findByProductId(productId: EntityId): Promise<DeliveryItemDTO[]> {
		const rows = await this.knex<DeliveryItemDatabaseTable>(this.tableName)
			.select("*")
			.where({ product_id: productId })

		const deliveryItems = []
		for (const row of rows) {
			deliveryItems.push(this.mapToDTO(row))
		}
		return deliveryItems
	}

	mapToDTO(row: DeliveryItemDatabaseTable): DeliveryItemDTO {
		return {
			deliveryId: row.delivery_id,
			id: row.id,
			productId: row.product_id,
			quantity: row.quantity,
		}
	}
}
