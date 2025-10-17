import { AggregateRoot } from "../../../../core/interfaces/AggregateRoot.js"
import { EntityId } from "../../../../core/types/EntityId.js"

export class ProphetModel extends AggregateRoot {
	private constructor(
		id: EntityId,
		private _productId: EntityId,
		private _filePath: string | null,
		private _active: boolean,
		private _trainedAt: Date | null,
	) {
		super(id)
	}

	static create(
		id: EntityId,
		productId: EntityId,
		filePath: string | null,
		active: boolean,
		trainedAt: Date | null,
	) {
		return new ProphetModel(id, productId, filePath, active, trainedAt)
	}

	public get trainedAt(): Date | null {
		return this._trainedAt
	}
	public set trainedAt(value: Date | null) {
		this._trainedAt = value
	}
	public get active(): boolean {
		return this._active
	}
	public set active(value: boolean) {
		this._active = value
	}
	public get filePath(): string | null {
		return this._filePath
	}
	public set filePath(value: string | null) {
		this._filePath = value
	}
	public get productId(): EntityId {
		return this._productId
	}
	public set productId(value: EntityId) {
		this._productId = value
	}
}
