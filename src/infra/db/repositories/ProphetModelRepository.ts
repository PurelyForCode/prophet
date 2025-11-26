import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { IProphetModelRepository } from "../../../domain/forecasting/repositories/IProphetModelRepository.js"
import { ProphetModelDAO, ProphetModelDTO } from "../dao/ProphetModelDao.js"
import { ProphetModel } from "../../../domain/forecasting/entities/prophet_model/ProphetModel.js"
import {
	ProphetHolidayDao,
	ProphetHolidayDto,
} from "../dao/ProphetHolidayDao.js"
import { ProphetSeasonDao, ProphetSeasonDto } from "../dao/ProphetSeasonDao.js"
import {
	ProphetChangepointDao,
	ProphetChangepointDto,
} from "../dao/ProphetChangepointDao.js"
import { ProphetHoliday } from "../../../domain/forecasting/entities/prophet_model_holiday/ProphetHoliday.js"
import { StandardName } from "../../../core/value_objects/StandardName.js"
import { ProphetSeasonality } from "../../../domain/forecasting/entities/prophet_model_seasonality/ProphetSeasonality.js"
import { FourierOrder } from "../../../domain/forecasting/entities/prophet_model_seasonality/value_object/FourierOrder.js"
import { SeasonalPeriodDays } from "../../../domain/forecasting/entities/prophet_model_seasonality/value_object/SeasonalPeriodDays.js"
import { PriorScale } from "../../../domain/forecasting/entities/prophet_model_seasonality/value_object/PriorScale.js"
import { ForecastingEffect } from "../../../domain/forecasting/entities/prophet_model_setting/value_objects/ForecastingEffect.js"
import { ProphetChangepoint } from "../../../domain/forecasting/entities/prophet_model_changepoint/ProphetChangepoint.js"

export class ProphetModelRepository implements IProphetModelRepository {
	private prophetModelDao: ProphetModelDAO
	private prophetHolidayDao: ProphetHolidayDao
	private prophetSeasonDao: ProphetSeasonDao
	private prophetChangepointDao: ProphetChangepointDao

	constructor(knex: Knex) {
		this.prophetModelDao = new ProphetModelDAO(knex)
		this.prophetHolidayDao = new ProphetHolidayDao(knex)
		this.prophetSeasonDao = new ProphetSeasonDao(knex)
		this.prophetChangepointDao = new ProphetChangepointDao(knex)
	}

	async doesProductHaveActiveModel(productId: EntityId): Promise<boolean> {
		return await this.prophetModelDao.doesProductHaveActiveModel(productId)
	}

	async delete(entity: ProphetModel): Promise<void> {
		await this.prophetModelDao.delete(entity.id)

		const holidays = entity.holidays
		for (const holiday of holidays.values()) {
			await this.prophetHolidayDao.delete(holiday.id)
		}
		const seasons = entity.seasonality
		for (const season of seasons.values()) {
			await this.prophetSeasonDao.delete(season.id)
		}

		const changepoints = entity.changepoint
		for (const changepoint of changepoints.values()) {
			await this.prophetChangepointDao.delete(changepoint.id)
		}
	}

	async update(entity: ProphetModel): Promise<void> {
		await this.prophetModelDao.update({
			active: entity.active,
			file_path: entity.filePath,
			id: entity.id,
			name: entity.name,
			product_id: entity.productId,
			trained_at: entity.trainedAt,
		})

		const holidays = entity.holidays
		for (const holiday of holidays.values()) {
			await this.prophetHolidayDao.update({
				ds: holiday.date,
				holiday_name: holiday.name.value,
				id: holiday.id,
				lower_window: holiday.lowerWindow,
				upper_window: holiday.upperWindow,
				model_setting_id: holiday.modelSettingId,
			})
		}
		const seasons = entity.seasonality
		for (const season of seasons.values()) {
			await this.prophetSeasonDao.update({
				fourier_order: season.fourierOrder.value,
				id: season.id,
				mode: season.mode.value,
				model_setting_id: season.modelSettingId,
				name: season.name.value,
				period_days: season.periodDays.value,
				prior_scale: season.priorScale.value,
			})
		}

		const changepoints = entity.changepoint
		for (const changepoint of changepoints.values()) {
			await this.prophetChangepointDao.update({
				id: changepoint.id,
				model_setting_id: changepoint.modelSettingId,
				changepoint_date: changepoint.changepointDate,
			})
		}
	}

	async create(entity: ProphetModel): Promise<void> {
		await this.prophetModelDao.insert({
			active: entity.active,
			file_path: entity.filePath,
			id: entity.id,
			name: entity.name,
			product_id: entity.productId,
			trained_at: entity.trainedAt,
		})
		const holidays = entity.holidays
		for (const holiday of holidays.values()) {
			await this.prophetHolidayDao.insert({
				ds: holiday.date,
				holiday_name: holiday.name.value,
				id: holiday.id,
				lower_window: holiday.lowerWindow,
				upper_window: holiday.upperWindow,
				model_setting_id: holiday.modelSettingId,
			})
		}
		const seasons = entity.seasonality
		for (const season of seasons.values()) {
			await this.prophetSeasonDao.insert({
				fourier_order: season.fourierOrder.value,
				id: season.id,
				mode: season.mode.value,
				model_setting_id: season.modelSettingId,
				name: season.name.value,
				period_days: season.periodDays.value,
				prior_scale: season.priorScale.value,
			})
		}

		const changepoints = entity.changepoint
		for (const changepoint of changepoints.values()) {
			await this.prophetChangepointDao.insert({
				changepoint_date: changepoint.changepointDate,
				id: changepoint.id,
				model_setting_id: changepoint.modelSettingId,
			})
		}
	}

	async findById(id: EntityId): Promise<ProphetModel | null> {
		const row = await this.prophetModelDao.findById(id)
		if (!row) {
			return null
		}
		const seasons = await this.prophetSeasonDao.findAllByModelId(row.id)
		const holidays = await this.prophetHolidayDao.findAllByModelId(row.id)
		const changepoints = await this.prophetChangepointDao.findAllByModelId(
			row.id,
		)
		return this.mapToEntity(row, holidays, changepoints, seasons)
	}

	mapToEntity(
		row: ProphetModelDTO,
		holidays: ProphetHolidayDto[],
		changepoints: ProphetChangepointDto[],
		seasons: ProphetSeasonDto[],
	): ProphetModel {
		const holidayEntities = new Map()
		for (const holiday of holidays) {
			const holidayEntity = ProphetHoliday.create({
				id: holiday.id,
				date: holiday.ds,
				modelSettingId: holiday.modelSettingId,
				name: new StandardName(holiday.holidayName, "holiday name"),
				lowerWindow: holiday.lowerWindow,
				upperWindow: holiday.upperWindow,
			})
			holidayEntities.set(holidayEntity.id, holidayEntity)
		}

		const seasonEntities = new Map()
		for (const season of seasons) {
			const seasonEntity = ProphetSeasonality.create({
				id: season.id,
				fourierOrder: new FourierOrder(season.fourierOrder),
				periodDays: new SeasonalPeriodDays(season.periodDays),
				modelSettingId: season.modelSettingId,
				mode: new ForecastingEffect(season.mode),
				priorScale: new PriorScale(season.priorScale),
				name: new StandardName(season.name, "holiday name"),
			})
			seasonEntities.set(seasonEntity.id, seasonEntity)
		}

		const changepointEntities = new Map()
		for (const changepoint of changepoints) {
			const changepointEntity = ProphetChangepoint.create({
				id: changepoint.id,
				modelSettingId: changepoint.modelSettingId,
				changepointDate: changepoint.changepointDate,
			})
			changepointEntities.set(changepointEntity.id, changepointEntity)
		}
		return ProphetModel.create(
			row.id,
			row.productId,
			row.filePath,
			row.active,
			row.trainedAt,
			holidayEntities,
			changepointEntities,
			seasonEntities,
		)
	}
}
