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
import { ProphetModelMissingChangepointException } from "../../exceptions/ProphetModelMissingChangepointException.js"
import { ProphetModelMissingHolidayException } from "../../exceptions/ProphetModelMissingHolidayException.js"
import { ProphetModelMissingSeasonalityException } from "../../exceptions/ProphetModelMissingSeasonalityException.js"
import { ProphetChangepoint } from "../prophet_model_changepoint/ProphetChangepoint.js"
import { ProphetHoliday } from "../prophet_model_holiday/ProphetHoliday.js"
import { ProphetSeasonality } from "../prophet_model_seasonality/ProphetSeasonality.js"

export class ProphetModel extends AggregateRoot {
	private constructor(
		id: EntityId,
		private _productId: EntityId,
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
	}

	removeSeasonality(id: EntityId) {
		const exists = this.seasonality.has(id)
		if (!exists) {
			throw new ProphetModelMissingSeasonalityException()
		}
		this.seasonality.delete(id)
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
	}

	removeChangepoint(id: EntityId) {
		const exists = this.changepoint.has(id)
		if (!exists) {
			throw new ProphetModelMissingChangepointException()
		}
		this.changepoint.delete(id)
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
	}

	removeHoliday(id: EntityId) {
		const exists = this.holidays.has(id)
		if (!exists) {
			throw new ProphetModelMissingHolidayException()
		}
		this.holidays.delete(id)
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
}
