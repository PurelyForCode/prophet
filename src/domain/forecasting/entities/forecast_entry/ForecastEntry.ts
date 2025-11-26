import { Entity } from "../../../../core/interfaces/Entity.js"
import { EntityId } from "../../../../core/types/EntityId.js"

export class ForecastEntry extends Entity {
	private constructor(
		id: EntityId,
		private _forecastId: EntityId,
		private _yhat: number,
		private _yhatLower: number,
		private _yhatUpper: number,
		private _date: Date,
	) {
		super(id)
	}

	public static create(params: {
		id: EntityId
		forecastId: EntityId
		yhat: number
		yhatLower: number
		yhatUpper: number
		date: Date
	}) {
		return new ForecastEntry(
			params.id,
			params.forecastId,
			params.yhat,
			params.yhatLower,
			params.yhatUpper,
			params.date,
		)
	}

	public get forecastId(): EntityId {
		return this._forecastId
	}
	public set forecastId(value: EntityId) {
		this._forecastId = value
	}
	public get yhat(): number {
		return this._yhat
	}
	public set yhat(value: number) {
		this._yhat = value
	}
	public get yhatLower(): number {
		return this._yhatLower
	}
	public set yhatLower(value: number) {
		this._yhatLower = value
	}
	public get yhatUpper(): number {
		return this._yhatUpper
	}
	public set yhatUpper(value: number) {
		this._yhatUpper = value
	}
	public get date(): Date {
		return this._date
	}
	public set date(value: Date) {
		this._date = value
	}
}
