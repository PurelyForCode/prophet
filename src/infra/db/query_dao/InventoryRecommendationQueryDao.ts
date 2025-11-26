import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { Pagination } from "../types/queries/Pagination.js"
import { Sort, sortQuery } from "../utils/Sort.js"
import { BaseQueryDao } from "./BaseQueryDao.js"
import { InventoryRecommendationDatabaseTable } from "../types/tables/InventoryRecommendationDatabaseTable.js"

export type InventoryRecommendationQueryInclude = Partial<{}> | undefined
export type InventoryRecommendationIncludeField = "groups"
export type InventoryRecommendationFilters =
	| Partial<{
			status: string
			supplierId: EntityId
			productId: EntityId
	  }>
	| undefined
export type InventoryRecommendationSortableFields = "status"

export type InventoryRecommendationQueryDto = {
	id: EntityId
	productId: EntityId
	supplierId: EntityId
	leadTime: number
	status: string
	runsOutAt: Date
	restockAt: Date
	restockAmount: number
	coverageDays: number
}

export class InventoryRecommendationQueryDao extends BaseQueryDao {
	constructor(knex: Knex) {
		super(knex, "inventory_recommendation")
	}

	private readonly inventoryRecommendationSortFieldMap: Record<
		InventoryRecommendationSortableFields,
		string
	> = {
		status: "status",
	}

	async query(
		pagination: Pagination,
		filters: InventoryRecommendationFilters,
		sort: Sort<InventoryRecommendationSortableFields>,
	) {
		const builder = this.knex<
			InventoryRecommendationDatabaseTable & { product_id: EntityId }
		>(`${this.tableName} as i`)
			.join("forecast as f", "f.id", "i.forecast_id")
			.select(
				"i.id",
				"i.supplier_id",
				"i.leadtime",
				"i.status",
				"i.runs_out_at",
				"i.restock_at",
				"i.restock_amount",
				"i.coverage_days",
				"i.created_at",
				"i.updated_at",
				"f.product_id",
			)

		if (pagination) {
			if (pagination.limit) {
				builder.limit(pagination.limit)
			}
			if (pagination.offset) {
				builder.limit(pagination.offset)
			}
		}

		if (filters) {
			if (filters.status) {
				builder.where("i.status", "=", filters.status)
			}
			if (filters.supplierId) {
				builder.where("i.supplier_id", "=", filters.supplierId)
			}

			if (filters.productId) {
				builder.where("f.product_id", "=", filters.productId)
			}
		}

		if (sort) {
			sortQuery(builder, sort, this.inventoryRecommendationSortFieldMap)
		} else {
			sortQuery(
				builder,
				["-status"],
				this.inventoryRecommendationSortFieldMap,
			)
		}

		const rows = await builder
		const recommendations = []
		for (const row of rows) {
			recommendations.push(this.mapToQueryDto(row))
		}
		return recommendations
	}

	async queryById(id: EntityId) {
		const builder = this.knex<
			InventoryRecommendationDatabaseTable & { product_id: EntityId }
		>(`${this.tableName} as i`)
			.join("forecast as f", "f.id", "i.forecast_id")
			.select(
				"i.id",
				"i.supplier_id",
				"i.leadtime",
				"i.status",
				"i.runs_out_at",
				"i.restock_at",
				"i.restock_amount",
				"i.coverage_days",
				"i.created_at",
				"i.updated_at",
				"f.product_id",
			)
			.where("i.id", "=", id)
			.first()

		const row = await builder
		return this.mapToQueryDto(row)
	}

	private mapToQueryDto(
		row: InventoryRecommendationDatabaseTable & { product_id: EntityId },
	): InventoryRecommendationQueryDto {
		return {
			coverageDays: row.coverage_days,
			id: row.id,
			leadTime: row.leadtime,
			productId: row.product_id,
			restockAmount: row.restock_amount,
			restockAt: row.restock_at,
			runsOutAt: row.runs_out_at,
			status: row.status,
			supplierId: row.supplier_id,
		}
	}
}
