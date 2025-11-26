import { AggregateRoot } from "../../../../core/interfaces/AggregateRoot.js"
import { EntityCollection } from "../../../../core/types/EntityCollection.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { ChangepointSelectionMethod } from "./value_objects/ChangepointSelectionMethod.js"
import { ForecastingEffect } from "./value_objects/ForecastingEffect.js"
import { GrowthType } from "./value_objects/GrowthType.js"
import { ProphetChangepoint } from "../prophet_model_changepoint/ProphetChangepoint.js"
import { ProphetHoliday } from "../prophet_model_holiday/ProphetHoliday.js"
import { ProphetRegressor } from "../prophet_model_regressor/ProphetRegressor.js"
import { ProphetSeasonality } from "../prophet_model_seasonality/ProphetSeasonality.js"
import { PriorScale } from "../prophet_model_seasonality/value_object/PriorScale.js"

export class ProphetModelSetting extends AggregateRoot {
	private constructor(
		id: EntityId,
		private _prophetModelId: EntityId,
		private _growthType: GrowthType,
		private _capEnabled: boolean,
		private _changepointSelectionMethod: ChangepointSelectionMethod,
		private _changepointCount: number,
		private _changepointPriorScale: PriorScale,
		private _changepointRange: number,

		private _yearlySeasonality: boolean | "auto",
		private _weeklySeasonality: boolean | "auto",
		private _dailySeasonality: boolean | "auto",

		private _seasonalityMode: ForecastingEffect,
		private _seasonalityPriorScale: PriorScale,
		private _holidaysPriorScale: PriorScale,
		private _intervalWidth: number,
		private _uncertaintySamples: number,
		private _seed: number,
		private _createdAt: Date,

		private _seasonalities: EntityCollection<ProphetSeasonality>,
		private _holidays: EntityCollection<ProphetHoliday>,
		private _changepoints: EntityCollection<ProphetChangepoint>,
		private _regressor: EntityCollection<ProphetRegressor>,
	) {
		super(id)
	}

	public static create(props: {
		id: EntityId
		prophetModelId: EntityId
		growthType?: GrowthType
		capEnabled?: boolean
		changepointSelectionMethod?: ChangepointSelectionMethod
		changepointCount?: number
		changepointPriorScale?: PriorScale
		changepointRange?: number
		yearlySeasonality?: boolean
		weeklySeasonality?: boolean
		dailySeasonality?: boolean
		seasonalityMode?: ForecastingEffect
		seasonalityPriorScale?: PriorScale
		holidaysPriorScale?: PriorScale
		intervalWidth?: number
		uncertaintySamples?: number
		seed: number
		createdAt: Date
		seasonalities?: EntityCollection<ProphetSeasonality>
		holidays?: EntityCollection<ProphetHoliday>
		changepoints?: EntityCollection<ProphetChangepoint>
		regressors?: EntityCollection<ProphetRegressor>
	}): ProphetModelSetting {
		return new ProphetModelSetting(
			props.id,
			props.prophetModelId,
			props.growthType ?? new GrowthType("linear"),
			props.capEnabled ?? false,
			props.changepointSelectionMethod ??
				new ChangepointSelectionMethod("auto"),
			props.changepointCount ?? 25,
			props.changepointPriorScale ?? new PriorScale(0.05),
			props.changepointRange ?? 0.8,
			props.yearlySeasonality ?? "auto",
			props.weeklySeasonality ?? "auto",
			props.dailySeasonality ?? "auto",
			props.seasonalityMode ?? new ForecastingEffect("additive"),
			props.seasonalityPriorScale ?? new PriorScale(10.0),
			props.holidaysPriorScale ?? new PriorScale(10.0),
			props.intervalWidth ?? 0.8,
			props.uncertaintySamples ?? 1000,
			props.seed,
			props.createdAt,
			props.seasonalities ?? new Map<EntityId, ProphetSeasonality>(),
			props.holidays ?? new Map<EntityId, ProphetHoliday>(),
			props.changepoints ?? new Map<EntityId, ProphetChangepoint>(),
			props.regressors ?? new Map<EntityId, ProphetRegressor>(),
		)
	}

	public get regressor(): EntityCollection<ProphetRegressor> {
		return this._regressor
	}
	public set regressor(value: EntityCollection<ProphetRegressor>) {
		this._regressor = value
	}
	public get changepoints(): EntityCollection<ProphetChangepoint> {
		return this._changepoints
	}
	public set changepoints(value: EntityCollection<ProphetChangepoint>) {
		this._changepoints = value
	}
	public get holidays(): EntityCollection<ProphetHoliday> {
		return this._holidays
	}
	public set holidays(value: EntityCollection<ProphetHoliday>) {
		this._holidays = value
	}
	public get seasonalities(): EntityCollection<ProphetSeasonality> {
		return this._seasonalities
	}
	public set seasonalities(value: EntityCollection<ProphetSeasonality>) {
		this._seasonalities = value
	}
	public get createdAt(): Date {
		return this._createdAt
	}
	public set createdAt(value: Date) {
		this._createdAt = value
	}
	public get seed(): number {
		return this._seed
	}
	public set seed(value: number) {
		this._seed = value
	}
	public get uncertaintySamples(): number {
		return this._uncertaintySamples
	}
	public set uncertaintySamples(value: number) {
		this._uncertaintySamples = value
	}
	public get intervalWidth(): number {
		return this._intervalWidth
	}
	public set intervalWidth(value: number) {
		this._intervalWidth = value
	}
	public get holidaysPriorScale(): PriorScale {
		return this._holidaysPriorScale
	}
	public set holidaysPriorScale(value: PriorScale) {
		this._holidaysPriorScale = value
	}
	public get seasonalityPriorScale(): PriorScale {
		return this._seasonalityPriorScale
	}
	public set seasonalityPriorScale(value: PriorScale) {
		this._seasonalityPriorScale = value
	}
	public get seasonalityMode(): ForecastingEffect {
		return this._seasonalityMode
	}
	public set seasonalityMode(value: ForecastingEffect) {
		this._seasonalityMode = value
	}
	public get dailySeasonality(): boolean | "auto" {
		return this._dailySeasonality
	}
	public set dailySeasonality(value: boolean | "auto") {
		this._dailySeasonality = value
	}
	public get weeklySeasonality(): boolean | "auto" {
		return this._weeklySeasonality
	}
	public set weeklySeasonality(value: boolean | "auto") {
		this._weeklySeasonality = value
	}
	public get yearlySeasonality(): boolean | "auto" {
		return this._yearlySeasonality
	}
	public set yearlySeasonality(value: boolean | "auto") {
		this._yearlySeasonality = value
	}
	public get changepointRange(): number {
		return this._changepointRange
	}
	public set changepointRange(value: number) {
		this._changepointRange = value
	}
	public get changepointPriorScale(): PriorScale {
		return this._changepointPriorScale
	}
	public set changepointPriorScale(value: PriorScale) {
		this._changepointPriorScale = value
	}
	public get changepointCount(): number {
		return this._changepointCount
	}
	public set changepointCount(value: number) {
		this._changepointCount = value
	}
	public get changepointSelectionMethod(): ChangepointSelectionMethod {
		return this._changepointSelectionMethod
	}
	public set changepointSelectionMethod(value: ChangepointSelectionMethod) {
		this._changepointSelectionMethod = value
	}
	public get capEnabled(): boolean {
		return this._capEnabled
	}
	public set capEnabled(value: boolean) {
		this._capEnabled = value
	}
	public get growthType(): GrowthType {
		return this._growthType
	}
	public set growthType(value: GrowthType) {
		this._growthType = value
	}
	public get prophetModelId(): EntityId {
		return this._prophetModelId
	}
	public set prophetModelId(value: EntityId) {
		this._prophetModelId = value
	}
}
