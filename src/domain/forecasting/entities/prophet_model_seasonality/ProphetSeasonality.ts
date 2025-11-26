import { Entity } from "../../../../core/interfaces/Entity.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { StandardName } from "../../../../core/value_objects/StandardName.js"
import { ForecastingEffect } from "../prophet_model_setting/value_objects/ForecastingEffect.js"
import { FourierOrder } from "./value_object/FourierOrder.js"
import { PriorScale } from "./value_object/PriorScale.js"
import { SeasonalPeriodDays } from "./value_object/SeasonalPeriodDays.js"

export class ProphetSeasonality extends Entity {
	private constructor(
		id: EntityId,
		private _modelSettingId: EntityId,
		private _name: StandardName,
		private _periodDays: SeasonalPeriodDays,
		private _fourierOrder: FourierOrder,
		private _priorScale: PriorScale,
		private _mode: ForecastingEffect,
	) {
		super(id)
	}

	public static create(props: {
		id: EntityId
		modelSettingId: EntityId
		name: StandardName
		periodDays: SeasonalPeriodDays
		fourierOrder: FourierOrder
		priorScale?: PriorScale
		mode?: ForecastingEffect
	}): ProphetSeasonality {
		return new ProphetSeasonality(
			props.id,
			props.modelSettingId,
			props.name,
			props.periodDays,
			props.fourierOrder,
			props.priorScale ?? new PriorScale(10.0),
			props.mode ?? new ForecastingEffect("additive"),
		)
	}

	public get mode(): ForecastingEffect {
		return this._mode
	}
	public set mode(value: ForecastingEffect) {
		this._mode = value
	}

	public get priorScale(): PriorScale {
		return this._priorScale
	}
	public set priorScale(value: PriorScale) {
		this._priorScale = value
	}
	public get fourierOrder(): FourierOrder {
		return this._fourierOrder
	}
	public set fourierOrder(value: FourierOrder) {
		this._fourierOrder = value
	}
	public get name(): StandardName {
		return this._name
	}
	public set name(value: StandardName) {
		this._name = value
	}
	public get periodDays(): SeasonalPeriodDays {
		return this._periodDays
	}
	public set periodDays(value: SeasonalPeriodDays) {
		this._periodDays = value
	}
	public get modelSettingId(): EntityId {
		return this._modelSettingId
	}
	public set modelSettingId(value: EntityId) {
		this._modelSettingId = value
	}
}
