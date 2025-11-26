import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { defaultPagination, Pagination } from "../types/queries/Pagination.js"
import { Sort, sortQuery } from "../utils/Sort.js"
import { BaseQueryDao } from "./BaseQueryDao.js"
import { DeliveryItemDatabaseTable } from "../types/tables/DeliveryItemDatabaseTable.js"

export type DeliveryItemQueryDto = {
	id: EntityId
	quantity: number
	product: {
		id: EntityId
		name: string
		stock: number
	}
}

export type DeliveryItemQueryFilters =
	| Partial<{
			productId: EntityId
	  }>
	| undefined

export type DeliveryItemSortableFields = "quantity"

export class DeliveryItemQueryDao extends BaseQueryDao {
	constructor(knex: Knex) {
		super(knex, "delivery_item")
	}

	private readonly deliverySortFieldMap: Record<
		DeliveryItemSortableFields,
		string
	> = {
		quantity: "i.quantity",
	}

	async queryByDeliveryId(
		deliveryId: EntityId,
		pagination: Pagination,
		filters: DeliveryItemQueryFilters,
		sort: Sort<DeliveryItemSortableFields>,
	): Promise<DeliveryItemQueryDto[]> {
		const builder = this.knex<DeliveryItemDatabaseTable>(
			`${this.tableName} as i`,
		)
			.select("i.id", "i.product_id", "i.quantity")
			.where("i.delivery_id", "=", deliveryId)

		if (filters) {
			if (filters.productId) {
				builder.where("product_id", "=", filters.productId)
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
			sortQuery(builder, ["-quantity"], this.deliverySortFieldMap)
		}

		const rows: DeliveryItemDatabaseTable[] = await builder
		let items: DeliveryItemQueryDto[] = []
		for (const row of rows) {
			const product = await this.knex<{
				id: EntityId
				name: string
				stock: number
			}>("product as p")
				.select("p.id", "p.name", "p.stock")
				.where("p.id", "=", row.product_id)
				.first()

			items.push(this.mapToQueryDto(row, product))
		}
		return items
	}

	async queryById(id: EntityId) {
		const item = await this.knex<DeliveryItemDatabaseTable>(this.tableName)
			.select("*")
			.where("id", "=", id)
			.first()
		if (!item) {
			return null
		}
		const product = await this.knex<{
			id: EntityId
			name: string
			stock: number
		}>("product as p")
			.select("p.id", "p.name", "p.stock")
			.where("p.id", "=", item.product_id)
			.first()
		return this.mapToQueryDto(item, product)
	}

	mapToQueryDto(
		row: DeliveryItemDatabaseTable,
		product: { name: string; id: EntityId; stock: number },
	): DeliveryItemQueryDto {
		return {
			id: row.id,
			quantity: row.quantity,
			product: {
				id: product.id,
				name: product.name,
				stock: product.stock,
			},
		}
	}
}
