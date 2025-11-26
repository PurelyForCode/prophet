import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { Forecast } from "../../../domain/forecasting/entities/forecast/Forecast.js"
import { IForecastRepository } from "../../../domain/forecasting/repositories/IForecastRepository.js"
import { ForecastDao, ForecastDto } from "../dao/ForecastDao.js"
import { DataDepth } from "../../../domain/forecasting/entities/forecast/value_objects/DataDepth.js"
import { ForecastEntryDao, ForecastEntryDto } from "../dao/ForecastEntryDao.js"
import { ForecastEntry } from "../../../domain/forecasting/entities/forecast_entry/ForecastEntry.js"
import { ModelType } from "../../../domain/forecasting/entities/forecast/value_objects/ModelType.js"

export class ForecastRepository implements IForecastRepository {
	private readonly forecastDao: ForecastDao
	private readonly entryDao: ForecastEntryDao
	constructor(knex: Knex) {
		this.forecastDao = new ForecastDao(knex)
		this.entryDao = new ForecastEntryDao(knex)
	}

	async delete(entity: Forecast): Promise<void> {
		await this.forecastDao.delete(entity.id)
	}
	async update(entity: Forecast): Promise<void> {
		await this.forecastDao.update({
			account_id: entity.accountId,
			created_at: entity.createdAt,
			croston_model_id: entity.crostonModelId,
			data_depth: entity.dataDepth.value,
			deleted_at: entity.deletedAt,
			forecast_end_date: entity.forecastEndDate,
			forecast_start_date: entity.forecastStartDate,
			id: entity.id,
			model_type: entity.modelType.value,
			processed: entity.processed,
			product_id: entity.productId,
			prophet_model_id: entity.prophetModelId,
			updated_at: entity.updatedAt,
		})
	}

	async create(entity: Forecast): Promise<void> {
		await this.forecastDao.insert({
			account_id: entity.accountId,
			created_at: entity.createdAt,
			croston_model_id: entity.crostonModelId,
			data_depth: entity.dataDepth.value,
			deleted_at: entity.deletedAt,
			forecast_end_date: entity.forecastEndDate,
			forecast_start_date: entity.forecastStartDate,
			id: entity.id,
			model_type: entity.modelType.value,
			processed: entity.processed,
			product_id: entity.productId,
			prophet_model_id: entity.prophetModelId,
			updated_at: entity.updatedAt,
		})
	}

	async findById(id: EntityId): Promise<Forecast | null> {
		const forecast = await this.forecastDao.findById(id)
		if (!forecast) {
			return null
		}
		const entries = await this.entryDao.findByForecastId(forecast.id)
		return this.mapToEntity(forecast, entries)
	}

	mapToEntity(row: ForecastDto, entryDtos: ForecastEntryDto[]): Forecast {
		const entries = new Map()
		for (const entryDto of entryDtos) {
			const entry = ForecastEntry.create({
				date: entryDto.date,
				forecastId: entryDto.forecastId,
				id: entryDto.id,
				yhat: entryDto.yhat,
				yhatLower: entryDto.yhatLower,
				yhatUpper: entryDto.yhatUpper,
			})
			entries.set(entry.id, entry)
		}
		return Forecast.create({
			id: row.id,
			accountId: row.accountId,
			crostonModelId: row.crostonModelId,
			prophetModelId: row.prophetModelId,
			modelType: new ModelType(row.modelType),
			createdAt: row.createdAt,
			dataDepth: new DataDepth(row.dataDepth),
			deletedAt: row.deletedAt,
			forecastEndDate: row.forecastEndDate,
			forecastStartDate: row.forecastStartDate,
			processed: row.processed,
			productId: row.productId,
			updatedAt: row.updatedAt,
			entries: entries,
		})
	}
}
