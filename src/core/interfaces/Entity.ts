import { EntityId } from "../types/EntityId.js"

export abstract class Entity<T = EntityId> {
	private _id: T

	public get id(): T {
		return this._id
	}

	public set id(value: T) {
		this._id = value
	}

	public key() {
		return typeof this._id === "object"
			? JSON.stringify(this._id)
			: String(this._id)
	}

	constructor(id: T) {
		this._id = id
	}
}
