import {
	AggregateRoot,
	EntityAction,
} from "../../../../core/interfaces/AggregateRoot.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { LeadTime } from "../../../delivery_management/entities/supplier/value_objects/LeadTime.js"
import { InventoryStatus } from "./value_objects/InventoryStatus.js"

export class InventoryRecommendation extends AggregateRoot {
	private constructor(
		id: EntityId,
		private _forecastId: EntityId,
		private _supplierId: EntityId,
		private _leadTime: LeadTime,
		private _status: InventoryStatus,
		private _runsOutAt: Date,
		private _restockAt: Date,
		private _restockAmount: number,
		private _coverageDays: number,
		private _createdAt: Date,
		private _updatedAt: Date,
	) {
		super(id)
	}

	static create(
		id: EntityId,
		forecastId: EntityId,
		supplierId: EntityId,
		leadTime: LeadTime,
		status: InventoryStatus,
		runsOutAt: Date,
		restockAt: Date,
		restockAmount: number,
		coverageDays: number,
		createdAt: Date,
		updatedAt: Date,
	) {
		return new InventoryRecommendation(
			id,
			forecastId,
			supplierId,
			leadTime,
			status,
			runsOutAt,
			restockAt,
			restockAmount,
			coverageDays,
			createdAt,
			updatedAt,
		)
	}

	public delete() {
		this.addTrackedEntity(this, EntityAction.deleted)
	}

	public get forecastId(): EntityId {
		return this._forecastId
	}
	public set forecastId(value: EntityId) {
		this._forecastId = value
	}
	public get supplierId(): EntityId {
		return this._supplierId
	}
	public set supplierId(value: EntityId) {
		this._supplierId = value
	}
	public get leadTime(): LeadTime {
		return this._leadTime
	}
	public set leadTime(value: LeadTime) {
		this._leadTime = value
	}
	public get runsOutAt(): Date {
		return this._runsOutAt
	}
	public set runsOutAt(value: Date) {
		this._runsOutAt = value
	}
	public get restockAt(): Date {
		return this._restockAt
	}
	public set restockAt(value: Date) {
		this._restockAt = value
	}
	public get restockAmount(): number {
		return this._restockAmount
	}
	public set restockAmount(value: number) {
		this._restockAmount = value
	}
	public get coverageDays(): number {
		return this._coverageDays
	}
	public set coverageDays(value: number) {
		this._coverageDays = value
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
	public get status(): InventoryStatus {
		return this._status
	}
	public set status(value: InventoryStatus) {
		this._status = value
	}
}
