import { Entity } from "../../../../core/interfaces/Entity.js"
import { EntityId } from "../../../../core/types/EntityId.js"

export class ProphetChangepoint extends Entity {
	private constructor(
		id: EntityId,
		private _modelSettingId: EntityId,
		private _changepointDate: Date,
	) {
		super(id)
	}

	public static create(props: {
		id: EntityId
		modelSettingId: EntityId
		changepointDate: Date
	}): ProphetChangepoint {
		return new ProphetChangepoint(
			props.id,
			props.modelSettingId,
			props.changepointDate,
		)
	}

	public get changepointDate(): Date {
		return this._changepointDate
	}
	public set changepointDate(value: Date) {
		this._changepointDate = value
	}
	public get modelSettingId(): EntityId {
		return this._modelSettingId
	}
	public set modelSettingId(value: EntityId) {
		this._modelSettingId = value
	}
}
