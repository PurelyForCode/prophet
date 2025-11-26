import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { BaseQueryDao } from "./BaseQueryDao.js"
import { ForecastDatabaseTable } from "../types/tables/ForecastDatabaseTable.js"
import { ForecastEntryQueryDao } from "./ForecastEntryQueryDao.js"
import { Sort, sortQuery } from "../utils/Sort.js"

export type ForecastQueryFilters =
	| Partial<{
			productId: EntityId
			latest: boolean
	  }>
	| undefined

export type ForecastIncludeFields = "entries"
export type ForecastSortFields = "date"
export type ForecastQueryInclude =
	| Partial<{
			entries: boolean
	  }>
	| undefined

export type ForecastEntryQueryDto = {
	id: EntityId
	yhat: number
	yhatUpper: number
	yhatLower: number
	date: Date
}

export type ForecastQueryDto = {
	id: EntityId
	accountId: EntityId
	productId: EntityId
	crostonModelId: EntityId | null
	prophetModelId: EntityId | null
	modelType: string
	dataDepth: number
	forecastStartDate: Date
	forecastEndDate: Date
	processed: boolean
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
	entries: ForecastEntryQueryDto[] | undefined
}

export class ForecastQueryDao extends BaseQueryDao {
	constructor(knex: Knex) {
		super(knex, "forecast")
	}
	private readonly sortFieldMap: Record<ForecastSortFields, string> = {
		date: "created_at",
	}

	async query(
		filters: ForecastQueryFilters,
		include: ForecastQueryInclude,
		sort: Sort<ForecastSortFields>,
	) {
		const builder = this.knex<ForecastDatabaseTable>(this.tableName).select(
			"*",
		)
		if (filters) {
			if (filters.productId) {
				builder.where("product_id", "=", filters.productId)
			}

			if (filters.latest === true) {
				builder.orderBy("created_at", "desc").limit(1)
			}
		}

		if (sort) {
			sortQuery<ForecastSortFields>(builder, sort, this.sortFieldMap)
		} else {
			sortQuery<ForecastSortFields>(builder, ["-date"], this.sortFieldMap)
		}

		const rows = await builder
		const forecasts = []
		for (const row of rows) {
			let entries = undefined
			if (include) {
				if (include.entries) {
					const forecastEntryQueryDao = new ForecastEntryQueryDao(
						this.knex,
					)
					entries = await forecastEntryQueryDao.query({
						forecastId: row.id,
					})
				}
			}
			forecasts.push(this.mapToQueryDto(row, entries))
		}
		return forecasts
	}

	async queryById(id: EntityId, include: ForecastQueryInclude) {
		const builder = this.knex(this.tableName)
			.select("*")
			.where("id", "=", id)
			.first()
		const row = await builder
		let entries = undefined
		if (include) {
			if (include.entries) {
				const forecastEntryQueryDao = new ForecastEntryQueryDao(
					this.knex,
				)
				entries = await forecastEntryQueryDao.query({
					forecastId: row.id,
				})
			}
		}
		return this.mapToQueryDto(row, entries)
	}

	private mapToQueryDto(
		row: ForecastDatabaseTable,
		entries: ForecastEntryQueryDto[] | undefined,
	): ForecastQueryDto {
		return {
			id: row.id,
			accountId: row.account_id,
			prophetModelId: row.prophet_model_id,
			crostonModelId: row.croston_model_id,
			dataDepth: row.data_depth,
			forecastEndDate: row.forecast_end_date,
			forecastStartDate: row.forecast_start_date,
			modelType: row.model_type,
			processed: row.processed,
			productId: row.product_id,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
			deletedAt: row.deleted_at,
			entries: entries,
		}
	}
}
