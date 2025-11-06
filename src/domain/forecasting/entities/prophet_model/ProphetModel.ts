import { AggregateRoot } from "../../../../core/interfaces/AggregateRoot.js"
import { EntityCollection } from "../../../../core/types/EntityCollection.js"
import { EntityId } from "../../../../core/types/EntityId.js"
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
		private _seasons: EntityCollection<ProphetSeasonality>,
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
	public get seasons(): EntityCollection<ProphetSeasonality> {
		return this._seasons
	}
	public set seasons(value: EntityCollection<ProphetSeasonality>) {
		this._seasons = value
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
