import { EntityId } from "../types/EntityId.js"

export abstract class Entity<T = EntityId> {
	private _id: T
	public get id(): T {
		return this._id
	}
	public set id(value: T) {
		this._id = value
	}
	constructor(id: T) {
		this._id = id
	}
}
