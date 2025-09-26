import { Knex } from "knex";
import { EntityId } from "../../../core/types/EntityId.js";
import { Pagination } from "../types/queries/Pagination.js";
import { QuerySort } from "../types/queries/QuerySort.js";
import { applySort } from "../utils/applySort.js";

export type DeliveryQueryFilters = Partial<
	{
		status: string,
		archived: boolean
	}
> | undefined

export type DeliverySortFields = "scheduledArrivalDate"

export type DeliveryQuerySort = QuerySort<DeliverySortFields> | undefined

export type DeliveryQueryDto = {
	id: EntityId;
	accountId: EntityId;
	status: string;
	completedAt: Date | null;
	deliveryRequestedAt: Date;
	scheduledArrivalDate: Date;
	cancelledAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
	supplier: {
		id: EntityId,
		name: string,
		leadTime: number
	}
	items: {
		id: EntityId
		quantity: number,
		product: {
			id: EntityId,
			name: string,
			stock: number,
		}
	}[]
};

export type DeliveryQueryRow = {
	delivery_id: EntityId
	delivery_supplier_id: EntityId
	delivery_account_id: EntityId
	delivery_status: string
	delivery_completed_at: Date | null
	delivery_requested_at: Date
	delivery_scheduled_arrival_date: Date
	delivery_cancelled_at: Date | null
	delivery_created_at: Date
	delivery_updated_at: Date
	delivery_deleted_at: Date | null

	delivery_item_id: EntityId
	delivery_item_quantity: number

	product_id: EntityId
	product_name: string
	product_stock: number

	supplier_id: EntityId
	supplier_name: string
	supplier_lead_time: number
}

export class DeliveryQueryDao {

	constructor(private readonly knex: Knex) { }
	private tableName = "delivery";

	private readonly deliverySortFieldMap: Record<DeliverySortFields, string> = {
		scheduledArrivalDate: "delivery.scheduled_arrival_date",
	};

	async query(pagination: Pagination, filters: DeliveryQueryFilters, sort: DeliveryQuerySort): Promise<DeliveryQueryDto[]> {
		const builder = this.knex<DeliveryQueryRow>(this.tableName)
			.select(
				"delivery.id as delivery_id",
				"delivery.supplier_id as delivery_supplier_id",
				"delivery.account_id as delivery_account_id",
				"delivery.status as delivery_status",
				"delivery.completed_at as delivery_completed_at",
				"delivery.requested_at as delivery_requested_at",
				"delivery.scheduled_arrival_date as delivery_scheduled_arrival_date",
				"delivery.cancelled_at as delivery_cancelled_at",
				"delivery.created_at as delivery_created_at",
				"delivery.updated_at as delivery_updated_at",
				"delivery.deleted_at as delivery_deleted_at",
				"supplier.id as supplier_id",
				"supplier.name as supplier_name",
				"supplier.lead_time as supplier_lead_time",
				"delivery_item.id as delivery_item_id",
				"delivery_item.delivery_id",
				"delivery_item.quantity",
				"product.id as product_id",
				"product.name as product_name",
				"product.stock as product_stock"
			)
			.join(
				"delivery_item",
				`${this.tableName}.id`,
				"delivery_item.delivery_id"
			).join(
				"product",
				"delivery_item.product_id",
				"product.id",
			).join(
				"supplier",
				"delivery.supplier_id",
				"supplier.id"
			)

		if (filters) {
			if (filters.archived) {
				builder.whereNotNull("delivery.deleted_at")
			} else {
				builder.whereNull("delivery.deleted_at")
			}
			if (filters.status) {
				builder.where("delivery.status", "=", filters.status)
			}
		}
		if (pagination) {
			if (pagination.limit) {
				builder.limit(pagination.limit)
			}
			if (pagination.offset) {
				builder.offset(pagination.offset)
			}
		}

		applySort(builder, sort, this.deliverySortFieldMap)

		const rows: DeliveryQueryRow[] = await builder
		return this.groupWithItems(rows)
	}

	async queryById(id: EntityId, archived: boolean | undefined) {
		const builder = this.knex<DeliveryQueryRow>(this.tableName)
			.select(
				"delivery.id as delivery_id",
				"delivery.supplier_id as delivery_supplier_id",
				"delivery.account_id as delivery_account_id",
				"delivery.status as delivery_status",
				"delivery.completed_at as delivery_completed_at",
				"delivery.requested_at as delivery_requested_at",
				"delivery.scheduled_arrival_date as delivery_scheduled_arrival_date",
				"delivery.cancelled_at as delivery_cancelled_at",
				"delivery.created_at as delivery_created_at",
				"delivery.updated_at as delivery_updated_at",
				"delivery.deleted_at as delivery_deleted_at",
				"supplier.id as supplier_id",
				"supplier.name as supplier_name",
				"supplier.lead_time as supplier_lead_time",
				"delivery_item.id as delivery_item_id",
				"delivery_item.delivery_id",
				"delivery_item.quantity",
				"product.id as product_id",
				"product.name as product_name",
				"product.stock as product_stock"
			)
			.join(
				"delivery_item",
				`${this.tableName}.id`,
				"delivery_item.delivery_id"
			).join(
				"product",
				"delivery_item.product_id",
				"product.id",
			).join(
				"supplier",
				"delivery.supplier_id",
				"supplier.id"
			)
			.where("delivery.id", "=", id)

		if (archived) {
			builder.whereNotNull("delivery.deleted_at")
		} else {
			builder.whereNull("delivery.deleted_at")
		}

		const rows = await builder
		if (!rows) {
			return null
		}
		return this.groupWithItems(rows)
	}

	groupWithItems(rows: DeliveryQueryRow[]) {
		const deliveryMap: Map<EntityId, DeliveryQueryDto> = new Map()
		for (const row of rows) {
			if (!deliveryMap.has(row.delivery_id)) {
				deliveryMap.set(row.delivery_id, {
					id: row.delivery_id,
					accountId: row.delivery_account_id,
					status: row.delivery_status,
					cancelledAt: row.delivery_cancelled_at,
					completedAt: row.delivery_completed_at,
					deliveryRequestedAt: row.delivery_requested_at,
					scheduledArrivalDate: row.delivery_scheduled_arrival_date,
					createdAt: row.delivery_created_at,
					updatedAt: row.delivery_updated_at,
					deletedAt: row.delivery_deleted_at,
					supplier: {
						id: row.supplier_id,
						leadTime: row.supplier_lead_time,
						name: row.supplier_name
					},
					items: []
				})
			}

			const delivery = deliveryMap.get(row.delivery_id)
			delivery!.items.push(
				{
					id: row.delivery_item_id,
					quantity: row.delivery_item_quantity,
					product: {
						id: row.product_id,
						name: row.product_name,
						stock: row.product_stock
					},
				}
			)
		}
		return Array.from(deliveryMap.values())
	}

	mapToQueryDto(row: DeliveryQueryRow) {
		return {
			id: row.delivery_id,
			accountId: row.delivery_account_id,
			status: row.delivery_status,
			cancelledAt: row.delivery_cancelled_at,
			completedAt: row.delivery_completed_at,
			deliveryRequestedAt: row.delivery_requested_at,
			scheduledArrivalDate: row.delivery_scheduled_arrival_date,
			createdAt: row.delivery_created_at,
			updatedAt: row.delivery_updated_at,
			deletedAt: row.delivery_deleted_at,
			supplier: {
				id: row.supplier_id,
				leadTime: row.supplier_lead_time,
				name: row.supplier_name
			},
			items: [{
				id: row.delivery_item_id,
				quantity: row.delivery_item_quantity,
				product: {
					id: row.product_id,
					name: row.product_name,
					stock: row.product_stock
				},
			}],
		}
	}
}


