import { Entity } from "../../../../core/interfaces/Entity.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { StandardName } from "../../../../core/value_objects/StandardName.js"
import { ForecastingEffect } from "../prophet_model_setting/value_objects/ForecastingEffect.js"

export class ProphetRegressor extends Entity {
	private constructor(
		id: EntityId,
		private _modelSettingId: EntityId,
		private _name: StandardName,
		private _priorScale: number,
		private _standardize: boolean,
		private _mode: ForecastingEffect,
	) {
		super(id)
	}

	public static create(props: {
		id: EntityId
		modelSettingId: EntityId
		name: StandardName
		priorScale: number
		standardize: boolean
		mode: ForecastingEffect
	}): ProphetRegressor {
		return new ProphetRegressor(
			props.id,
			props.modelSettingId,
			props.name,
			props.priorScale ?? 10.0,
			props.standardize ?? true,
			props.mode ?? new ForecastingEffect("additive"),
		)
	}

	public get mode(): ForecastingEffect {
		return this._mode
	}
	public set mode(value: ForecastingEffect) {
		this._mode = value
	}
	public get standardize(): boolean {
		return this._standardize
	}
	public set standardize(value: boolean) {
		this._standardize = value
	}
	public get priorScale(): number {
		return this._priorScale
	}
	public set priorScale(value: number) {
		this._priorScale = value
	}
	public get name(): StandardName {
		return this._name
	}
	public set name(value: StandardName) {
		this._name = value
	}
	public get modelSettingId(): EntityId {
		return this._modelSettingId
	}
	public set modelSettingId(value: EntityId) {
		this._modelSettingId = value
	}
}
