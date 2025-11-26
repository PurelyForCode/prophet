import { Entity } from "../../../../core/interfaces/Entity.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { StandardName } from "../../../../core/value_objects/StandardName.js"

export class ProphetHoliday extends Entity {
	private constructor(
		id: EntityId,
		private _modelSettingId_1: EntityId,
		private _name: StandardName,
		private _date: Date[],
		private _lowerWindow: number,
		private _upperWindow: number,
	) {
		super(id)
	}

	public static create(props: {
		id: EntityId
		modelSettingId: EntityId
		name: StandardName
		date: Date[]
		lowerWindow?: number
		upperWindow?: number
	}): ProphetHoliday {
		return new ProphetHoliday(
			props.id,
			props.modelSettingId,
			props.name,
			props.date,
			props.lowerWindow ?? 0,
			props.upperWindow ?? 0,
		)
	}

	public get upperWindow(): number {
		return this._upperWindow
	}
	public set upperWindow(value: number) {
		this._upperWindow = value
	}
	public get lowerWindow(): number {
		return this._lowerWindow
	}
	public set lowerWindow(value: number) {
		this._lowerWindow = value
	}
	public get date(): Date[] {
		return this._date
	}
	public set date(value: Date[]) {
		this._date = value
	}
	public get name(): StandardName {
		return this._name
	}
	public set name(value: StandardName) {
		this._name = value
	}
	public get modelSettingId(): EntityId {
		return this._modelSettingId_1
	}
	public set modelSettingId(value: EntityId) {
		this._modelSettingId_1 = value
	}
}
