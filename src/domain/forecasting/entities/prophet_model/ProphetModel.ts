import {
	AggregateRoot,
	EntityAction,
} from "../../../../core/interfaces/AggregateRoot.js"
import { EntityCollection } from "../../../../core/types/EntityCollection.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { DuplicateChangepointDateException } from "../../exceptions/DuplicateChangepointDateException.js"
import { DuplicateSeasonalityNameException } from "../../exceptions/DuplicateSeasonalityNameException.js"
import { ProphetModelDuplicateChangepointException } from "../../exceptions/ProphetModelDuplicateChangepointException.js"
import { ProphetModelDuplicateHolidayException } from "../../exceptions/ProphetModelDuplicateHolidayException.js"
import { ProphetModelDuplicateSeasonalityException } from "../../exceptions/ProphetModelDuplicateSeasonalityException.js"
import { ProphetChangepointNotFoundException } from "../../exceptions/ProphetChangepointNotFoundException.js"
import { ProphetHolidayNotFoundException } from "../../exceptions/ProphetHolidayNotFoundException.js"
import { ProphetSeasonalityNotFoundException } from "../../exceptions/ProphetSeasonalityNotFoundException.js"
import { ProphetChangepoint } from "../prophet_model_changepoint/ProphetChangepoint.js"
import { ProphetHoliday } from "../prophet_model_holiday/ProphetHoliday.js"
import { ProphetSeasonality } from "../prophet_model_seasonality/ProphetSeasonality.js"
import { StandardName } from "../../../../core/value_objects/StandardName.js"
import { SeasonalPeriodDays } from "../prophet_model_seasonality/value_object/SeasonalPeriodDays.js"
import { FourierOrder } from "../prophet_model_seasonality/value_object/FourierOrder.js"
import { PriorScale } from "../prophet_model_seasonality/value_object/PriorScale.js"
import { ForecastingEffect } from "../prophet_model_setting/value_objects/ForecastingEffect.js"
import { ValueException } from "../../../../core/exceptions/ValueException.js"

export class ProphetModel extends AggregateRoot {
	private constructor(
		id: EntityId,
		private _productId: EntityId,
		private _name: string,
		private _filePath: string | null,
		private _active: boolean,
		private _trainedAt: Date | null,
		private _holidays: EntityCollection<ProphetHoliday>,
		private _changepoint: EntityCollection<ProphetChangepoint>,
		private _seasonality: EntityCollection<ProphetSeasonality>,
	) {
		super(id)
	}

	static create(
		id: EntityId,
		productId: EntityId,
		name: string,
		filePath: string | null,
		active: boolean,
		trainedAt: Date | null,
		holidays: EntityCollection<ProphetHoliday>,
		changepoint: EntityCollection<ProphetChangepoint>,
		seasons: EntityCollection<ProphetSeasonality>,
	) {
		return new ProphetModel(
			id,
			productId,
			name,
			filePath,
			active,
			trainedAt,
			holidays,
			changepoint,
			seasons,
		)
	}

	delete() {
		this.addTrackedEntity(this, EntityAction.deleted)
	}

	getSeasonality(id: EntityId) {
		return this.seasonality.get(id)
	}

	addSeasonality(newSeasonality: ProphetSeasonality) {
		const exists = this.seasonality.has(newSeasonality.id)
		if (exists) {
			throw new ProphetModelDuplicateSeasonalityException()
		}
		for (const seasonality of this.seasonality.values()) {
			if (seasonality.name.value === newSeasonality.name.value) {
				throw new DuplicateSeasonalityNameException()
			}
		}

		this.seasonality.set(newSeasonality.id, newSeasonality)
		this.addTrackedEntity(newSeasonality, EntityAction.created)
	}

	updateSeasonality(
		id: EntityId,
		fields: Partial<{
			name: StandardName
			periodDays: SeasonalPeriodDays
			fourierOrder: FourierOrder
			priorScale: PriorScale
			mode: ForecastingEffect
		}>,
	) {
		const seasonality = this.seasonality.get(id)
		if (!seasonality) {
			throw new ProphetSeasonalityNotFoundException()
		}
		if (fields.name) {
			for (const seasonality of this.seasonality.values()) {
				if (seasonality.name.value === fields.name.value) {
					throw new DuplicateSeasonalityNameException()
				}
			}
			seasonality.name = fields.name
		}
		if (fields.periodDays) {
			seasonality.periodDays = fields.periodDays
		}
		if (fields.fourierOrder) {
			seasonality.fourierOrder = fields.fourierOrder
		}
		if (fields.priorScale) {
			seasonality.priorScale = fields.priorScale
		}
		if (fields.mode) {
			seasonality.mode = fields.mode
		}
		this.addTrackedEntity(seasonality, EntityAction.updated)
	}

	removeSeasonality(id: EntityId) {
		const exists = this.seasonality.get(id)
		if (!exists) {
			throw new ProphetSeasonalityNotFoundException()
		}
		this.seasonality.delete(id)
		this.addTrackedEntity(exists, EntityAction.deleted)
	}

	getChangepoint(id: EntityId) {
		return this.changepoint.get(id)
	}

	addChangepoint(newChangepoint: ProphetChangepoint) {
		const exists = this.seasonality.has(newChangepoint.id)
		if (exists) {
			throw new ProphetModelDuplicateChangepointException()
		}
		for (const changepoint of this.changepoint.values()) {
			if (
				changepoint.changepointDate === newChangepoint.changepointDate
			) {
				throw new DuplicateChangepointDateException()
			}
		}
		this.changepoint.set(newChangepoint.id, newChangepoint)
		this.addTrackedEntity(newChangepoint, EntityAction.created)
	}

	updateChangepoint(id: EntityId, date: Date) {
		const changepoint = this.changepoint.get(id)
		if (!changepoint) {
			throw new ProphetChangepointNotFoundException()
		}
		changepoint.changepointDate = date
		this.addTrackedEntity(changepoint, EntityAction.updated)
	}

	removeChangepoint(id: EntityId) {
		const exists = this.changepoint.get(id)
		if (!exists) {
			throw new ProphetChangepointNotFoundException()
		}
		this.changepoint.delete(id)
		this.addTrackedEntity(exists, EntityAction.deleted)
	}

	getHoliday(id: EntityId) {
		return this.holidays.get(id)
	}

	addHoliday(newHoliday: ProphetHoliday) {
		const exists = this.holidays.has(newHoliday.id)
		if (exists) {
			throw new ProphetModelDuplicateHolidayException()
		}

		for (const holiday of this.holidays.values()) {
			if (holiday.name.value === newHoliday.name.value) {
				throw new DuplicateSeasonalityNameException()
			}
		}
		this.holidays.set(newHoliday.id, newHoliday)

		this.addTrackedEntity(newHoliday, EntityAction.created)
	}

	updateHoliday(
		id: EntityId,
		fields: Partial<{
			name: StandardName
			date: Date[]
			lowerWindow: number
			upperWindow: number
		}>,
	) {
		const holiday = this.holidays.get(id)
		if (!holiday) {
			throw new ProphetHolidayNotFoundException()
		}
		if (fields.name) {
			holiday.name = fields.name
		}
		if (fields.date) {
			holiday.date = fields.date
		}
		if (fields.lowerWindow) {
			holiday.lowerWindow = fields.lowerWindow
		}
		if (fields.upperWindow) {
			holiday.upperWindow = fields.upperWindow
		}
		if (holiday.lowerWindow > holiday.upperWindow) {
			throw new ValueException(
				"holiday lower window can not be lower than upper window",
			)
		}
		this.addTrackedEntity(holiday, EntityAction.updated)
	}

	removeHoliday(id: EntityId) {
		const exists = this.holidays.get(id)
		if (!exists) {
			throw new ProphetHolidayNotFoundException()
		}
		this.holidays.delete(id)
		this.addTrackedEntity(exists, EntityAction.deleted)
	}

	public get trainedAt(): Date | null {
		return this._trainedAt
	}
	public set trainedAt(value: Date | null) {
		this._trainedAt = value
	}
	public get active(): boolean {
		return this._active
	}
	public set active(value: boolean) {
		this._active = value
	}
	public get filePath(): string | null {
		return this._filePath
	}
	public set filePath(value: string | null) {
		this._filePath = value
	}
	public get productId(): EntityId {
		return this._productId
	}
	public set productId(value: EntityId) {
		this._productId = value
	}
	public get seasonality(): EntityCollection<ProphetSeasonality> {
		return this._seasonality
	}
	public set seasonality(value: EntityCollection<ProphetSeasonality>) {
		this._seasonality = value
	}
	public get changepoint(): EntityCollection<ProphetChangepoint> {
		return this._changepoint
	}
	public set changepoint(value: EntityCollection<ProphetChangepoint>) {
		this._changepoint = value
	}
	public get holidays(): EntityCollection<ProphetHoliday> {
		return this._holidays
	}
	public set holidays(value: EntityCollection<ProphetHoliday>) {
		this._holidays = value
	}
	public get name(): string {
		return this._name
	}
	public set name(value: string) {
		this._name = value
	}
}
