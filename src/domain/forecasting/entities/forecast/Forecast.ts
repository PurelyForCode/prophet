import {
	AggregateRoot,
	EntityAction,
} from "../../../../core/interfaces/AggregateRoot.js"
import { EntityCollection } from "../../../../core/types/EntityCollection.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { ForecastEntry } from "../forecast_entry/ForecastEntry.js"
import { ModelType } from "./value_objects/ModelType.js"
import { DataDepth } from "./value_objects/DataDepth.js"

export class Forecast extends AggregateRoot {
	private constructor(
		id: EntityId,
		private _productId: EntityId,
		private _accountId: EntityId,
		private _prophetModelId: EntityId | null,
		private _crostonModelId: EntityId | null,
		private _modelType: ModelType,
		private _dataDepth: DataDepth,
		private _forecastStartDate: Date,
		private _forecastEndDate: Date,
		private _processed: boolean,
		private _createdAt: Date,
		private _updatedAt: Date,
		private _deletedAt: Date | null,
		private _entries: EntityCollection<ForecastEntry>,
	) {
		super(id)
	}

	public static create(params: {
		id: EntityId
		accountId: EntityId
		productId: EntityId
		prophetModelId: EntityId | null
		crostonModelId: EntityId | null
		modelType: ModelType
		dataDepth: DataDepth
		processed: boolean
		forecastStartDate: Date
		forecastEndDate: Date
		createdAt: Date
		updatedAt: Date
		deletedAt: Date | null
		entries: EntityCollection<ForecastEntry>
	}): Forecast {
		return new Forecast(
			params.id,
			params.productId,
			params.accountId,
			params.prophetModelId,
			params.crostonModelId,
			params.modelType,
			params.dataDepth,
			params.forecastStartDate,
			params.forecastEndDate,
			params.processed,
			params.createdAt,
			params.updatedAt,
			params.deletedAt,
			params.entries,
		)
	}

	archive() {
		this.deletedAt = new Date()
		this.addTrackedEntity(this, EntityAction.updated)
	}

	delete() {
		this.addTrackedEntity(this, EntityAction.deleted)
	}

	public get prophetModelId(): EntityId | null {
		return this._prophetModelId
	}

	public set prophetModelId(value: EntityId | null) {
		this._prophetModelId = value
	}
	public get crostonModelId(): EntityId | null {
		return this._crostonModelId
	}
	public set crostonModelId(value: EntityId | null) {
		this._crostonModelId = value
	}
	public get modelType(): ModelType {
		return this._modelType
	}
	public set modelType(value: ModelType) {
		this._modelType = value
	}
	public get accountId(): EntityId {
		return this._accountId
	}
	public set accountId(value: EntityId) {
		this._accountId = value
	}
	public get productId(): EntityId {
		return this._productId
	}
	public set productId(value: EntityId) {
		this._productId = value
	}
	public get dataDepth(): DataDepth {
		return this._dataDepth
	}
	public set dataDepth(value: DataDepth) {
		this._dataDepth = value
	}
	public get processed(): boolean {
		return this._processed
	}
	public set processed(value: boolean) {
		this._processed = value
	}
	public get forecastStartDate(): Date {
		return this._forecastStartDate
	}
	public set forecastStartDate(value: Date) {
		this._forecastStartDate = value
	}
	public get forecastEndDate(): Date {
		return this._forecastEndDate
	}
	public set forecastEndDate(value: Date) {
		this._forecastEndDate = value
	}
	public get createdAt(): Date {
		return this._createdAt
	}
	public set createdAt(value: Date) {
		this._createdAt = value
	}
	public get updatedAt(): Date {
		return this._updatedAt
	}
	public set updatedAt(value: Date) {
		this._updatedAt = value
	}
	public get deletedAt(): Date | null {
		return this._deletedAt
	}
	public set deletedAt(value: Date | null) {
		this._deletedAt = value
	}
	public get entries(): EntityCollection<ForecastEntry> {
		return this._entries
	}
	public set entries(value: EntityCollection<ForecastEntry>) {
		this._entries = value
	}
}
