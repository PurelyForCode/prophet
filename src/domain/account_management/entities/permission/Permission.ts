import { AggregateRoot } from "../../../../core/interfaces/AggregateRoot.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { StandardName } from "../../../../core/value_objects/StandardName.js"

export class Permission extends AggregateRoot {
	public get updatedAt(): Date {
		return this._updatedAt
	}
	public set updatedAt(value: Date) {
		this._updatedAt = value
	}
	public get createdAt(): Date {
		return this._createdAt
	}
	public set createdAt(value: Date) {
		this._createdAt = value
	}
	public get name(): StandardName {
		return this._name
	}
	public set name(value: StandardName) {
		this._name = value
	}
	private constructor(
		id: EntityId,
		private _name: StandardName,
		private _createdAt: Date,
		private _updatedAt: Date,
	) {
		super(id)
	}
	static create(
		id: EntityId,
		name: StandardName,
		createdAt: Date,
		updatedAt: Date,
	) {
		return new Permission(id, name, createdAt, updatedAt)
	}
}
