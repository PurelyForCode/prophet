import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { defaultPagination, Pagination } from "../types/queries/Pagination.js"
import { Sort, sortQuery } from "../utils/Sort.js"
import { BaseQueryDao } from "./BaseQueryDao.js"

export type DeliveryQueryFilters =
	| Partial<{
			status: string
			archived: boolean
	  }>
	| undefined

export type ItemQueryDto = {
	id: EntityId
	quantity: number
	product: {
		id: EntityId
		name: string
		stock: number
	}
}
export type DeliveryQueryDto = {
	id: EntityId
	accountId: EntityId
	status: string
	completedAt: Date | null
	requestedAt: Date
	scheduledArrivalDate: Date
	cancelledAt: Date | null
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
	supplier: {
		id: EntityId
		name: string
		leadTime: number
	}
	items: ItemQueryDto[]
}

export type DeliveryRow = {
	id: EntityId
	account_id: EntityId
	status: string
	completed_at: Date | null
	requested_at: Date
	scheduled_arrival_date: Date
	cancelled_at: Date | null
	created_at: Date
	updated_at: Date
	deleted_at: Date | null

	supplier_id: EntityId
	supplier_name: string
	supplier_lead_time: number
}

export type ItemRow = {
	product_id: EntityId
	product_name: string
	product_stock: number
	item_id: EntityId
	item_quantity: number
}

export type CompleteDeliveryRow = {
	id: EntityId
	account_id: EntityId
	status: string
	completed_at: Date | null
	requested_at: Date
	scheduled_arrival_date: Date
	cancelled_at: Date | null
	created_at: Date
	updated_at: Date
	deleted_at: Date | null

	supplier_id: EntityId
	supplier_name: string
	supplier_lead_time: number

	product_id: EntityId
	product_name: string
	product_stock: number
	item_id: EntityId
	item_quantity: number
}

export type DeliverySortableFields = "scheduledArrivalDate"

export class DeliveryQueryDao extends BaseQueryDao {
	constructor(knex: Knex) {
		super(knex, "delivery")
	}

	private readonly deliverySortFieldMap: Record<
		DeliverySortableFields,
		string
	> = {
		scheduledArrivalDate: "d.scheduled_arrival_date",
	}

	async query(
		pagination: Pagination,
		filters: DeliveryQueryFilters,
		sort: Sort<DeliverySortableFields>,
	): Promise<DeliveryQueryDto[]> {
		const builder = this.knex<DeliveryRow>(`${this.tableName} as d`)
			.select(
				"d.id",
				"d.account_id",
				"d.status",
				"d.completed_at",
				"d.requested_at",
				"d.scheduled_arrival_date",
				"d.cancelled_at",
				"d.created_at",
				"d.updated_at",
				"d.deleted_at",
				"s.id as supplier_id",
				"s.name as supplier_name",
				"s.lead_time as supplier_lead_time",
			)
			.join("supplier as s", "d.supplier_id", "s.id")

		if (filters && filters.archived) {
			builder.whereNotNull("d.deleted_at")
		} else {
			builder.whereNull("d.deleted_at")
		}
		if (filters) {
			if (filters.status) {
				builder.where("d.status", "=", filters.status)
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
			sortQuery(builder, sort, this.deliverySortFieldMap)
		} else {
			sortQuery(
				builder,
				["-scheduledArrivalDate"],
				this.deliverySortFieldMap,
			)
		}

		const rows: DeliveryRow[] = await builder
		let deliveries: DeliveryQueryDto[] = []
		for (const row of rows) {
			const items = await this.knex<ItemRow>("delivery_item as i")
				.select(
					"p.id as product_id",
					"p.name as product_name",
					"p.stock as product_stock",
					"i.id as item_id",
					"i.quantity as item_quantity",
				)
				.join("product as p", "p.id", "i.product_id")
				.where("i.delivery_id", "=", row.id)
				.whereNull("p.deleted_at")
			deliveries.push(this.mapToQueryDto(row, items))
		}
		return deliveries
	}

	async queryById(id: EntityId) {
		const builder = this.knex<CompleteDeliveryRow>(this.tableName)
			.select(
				"delivery.id",
				"delivery.supplier_id",
				"delivery.account_id",
				"delivery.status",
				"delivery.completed_at",
				"delivery.requested_at",
				"delivery.scheduled_arrival_date",
				"delivery.cancelled_at",
				"delivery.created_at",
				"delivery.updated_at",
				"delivery.deleted_at",

				"supplier.id as supplier_id",
				"supplier.name as supplier_name",
				"supplier.lead_time as supplier_lead_time",

				"delivery_item.id as item_id",
				"delivery_item.quantity as item_quantity",

				"product.id as product_id",
				"product.name as product_name",
				"product.stock as product_stock",
			)
			.join(
				"delivery_item",
				`${this.tableName}.id`,
				"delivery_item.delivery_id",
			)
			.join("product", "delivery_item.product_id", "product.id")
			.join("supplier", "delivery.supplier_id", "supplier.id")
			.where("delivery.id", "=", id)
			.whereNull("product.deleted_at")

		const rows = await builder

		if (rows.length === 0) {
			return null
		}

		return this.groupWithItems(rows)
	}

	groupWithItems(rows: CompleteDeliveryRow[]): DeliveryQueryDto[] {
		const deliveriesMap = new Map<EntityId, DeliveryQueryDto>()

		for (const row of rows) {
			let delivery = deliveriesMap.get(row.id)

			if (!delivery) {
				delivery = {
					id: row.id,
					accountId: row.account_id,
					status: row.status,
					completedAt: row.completed_at,
					requestedAt: row.requested_at,
					scheduledArrivalDate: row.scheduled_arrival_date,
					cancelledAt: row.cancelled_at,
					createdAt: row.created_at,
					updatedAt: row.updated_at,
					deletedAt: row.deleted_at,
					supplier: {
						id: row.supplier_id,
						name: row.supplier_name,
						leadTime: row.supplier_lead_time,
					},
					items: [],
				}

				deliveriesMap.set(row.id, delivery)
			}

			if (row.item_id) {
				delivery.items.push({
					id: row.item_id,
					quantity: row.item_quantity,
					product: {
						id: row.product_id,
						name: row.product_name,
						stock: row.product_stock,
					},
				})
			}
		}

		return Array.from(deliveriesMap.values())
	}

	mapToQueryDto(row: DeliveryRow, items: ItemRow[]): DeliveryQueryDto {
		let formattedItems: ItemQueryDto[] = []
		for (const item of items) {
			formattedItems.push({
				id: item.item_id,
				product: {
					id: item.product_id,
					name: item.product_name,
					stock: item.product_stock,
				},
				quantity: item.item_quantity,
			})
		}
		return {
			id: row.id,
			accountId: row.account_id,
			status: row.status,
			requestedAt: row.requested_at,
			scheduledArrivalDate: row.scheduled_arrival_date,
			completedAt: row.completed_at,
			cancelledAt: row.cancelled_at,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
			deletedAt: row.deleted_at,
			supplier: {
				id: row.id,
				leadTime: row.supplier_lead_time,
				name: row.supplier_name,
			},
			items: formattedItems,
		}
	}
}
