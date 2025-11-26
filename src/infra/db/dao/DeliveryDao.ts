import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { DeliveryStatus } from "../../../domain/delivery_management/entities/delivery/value_objects/DeliveryStatus.js"
import { DeliveryDatabaseTable } from "../types/tables/DeliveryDatabaseTable.js"
import { DeliveryItemDatabaseTable } from "../types/tables/DeliveryItemDatabaseTable.js"

export type ProductDeliveryDto = {
	productId: EntityId
	quantity: number
	arrivalDate: Date
}

export type DeliveryDTO = {
	id: EntityId
	supplierId: EntityId
	accountId: EntityId
	status: string
	completedAt: Date | null
	requestedAt: Date
	scheduledArrivalDate: Date
	cancelledAt: Date | null
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
}

export class DeliveryDAO {
	constructor(private readonly knex: Knex) {}
	private tableName = "delivery"
	async insert(table: DeliveryDatabaseTable) {
		const builder = this.knex<DeliveryDatabaseTable>(this.tableName).insert(
			{
				id: table.id,
				supplier_id: table.supplier_id,
				account_id: table.account_id,
				status: table.status,
				cancelled_at: table.cancelled_at,
				completed_at: table.completed_at,
				requested_at: table.requested_at,
				scheduled_arrival_date: table.scheduled_arrival_date,
				created_at: table.created_at,
				updated_at: table.updated_at,
				deleted_at: table.deleted_at,
			},
		)
		await builder
	}

	async delete(deliveryItemId: EntityId) {
		await this.knex(this.tableName).delete().where({ id: deliveryItemId })
	}

	async update(table: DeliveryDatabaseTable) {
		await this.knex<DeliveryDatabaseTable>(this.tableName)
			.update({
				account_id: table.account_id,
				cancelled_at: table.cancelled_at,
				completed_at: table.completed_at,
				created_at: table.created_at,
				deleted_at: table.deleted_at,
				requested_at: table.requested_at,
				id: table.id,
				scheduled_arrival_date: table.scheduled_arrival_date,
				status: table.status,
				supplier_id: table.supplier_id,
				updated_at: table.updated_at,
			})
			.where({ id: table.id })
	}

	async findById(id: EntityId): Promise<DeliveryDTO | null> {
		const row = await this.knex<DeliveryDatabaseTable>(this.tableName)
			.select("*")
			.where({ id: id })
			.first()
		if (!row) {
			return null
		} else {
			return this.mapToDTO(row)
		}
	}

	async findAllByDeliveryStatus(
		status: DeliveryStatus,
	): Promise<DeliveryDTO[]> {
		const rows = await this.knex<DeliveryDatabaseTable>(this.tableName)
			.select("*")
			.where({ status: status.value })
		const deliveries = []
		for (const row of rows) {
			deliveries.push(this.mapToDTO(row))
		}
		return deliveries
	}

	async findProductDeliveries(
		productId: EntityId,
	): Promise<ProductDeliveryDto[]> {
		const rows = await this.knex<
			DeliveryDatabaseTable & DeliveryItemDatabaseTable
		>("delivery as d")
			.select("d.scheduled_arrival_date", "i.product_id", "i.quantity")
			.join("delivery_item as i", "i.delivery_id", "d.id")
			.where("d.status", "=", "pending")
			.where("i.product_id", "=", productId)
		let productDeliveries = []
		for (const row of rows) {
			productDeliveries.push(this.mapToProductDeliveryDto(row))
		}
		return productDeliveries
	}

	mapToProductDeliveryDto(row: {
		scheduled_arrival_date: Date
		product_id: string
		quantity: number
	}): ProductDeliveryDto {
		return {
			productId: row.product_id,
			quantity: row.quantity,
			arrivalDate: row.scheduled_arrival_date,
		}
	}

	mapToDTO(row: DeliveryDatabaseTable): DeliveryDTO {
		return {
			accountId: row.account_id,
			cancelledAt: row.cancelled_at,
			completedAt: row.completed_at,
			createdAt: row.created_at,
			deletedAt: row.deleted_at,
			requestedAt: row.requested_at,
			id: row.id,
			scheduledArrivalDate: row.scheduled_arrival_date,
			status: row.status,
			supplierId: row.supplier_id,
			updatedAt: row.updated_at,
		}
	}
}
