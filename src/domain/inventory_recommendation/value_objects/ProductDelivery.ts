import { EntityId } from "../../../core/types/EntityId.js"

export class ProductDelivery {
	private constructor(
		private readonly _productId: EntityId,
		private readonly _quantity: number,
		private readonly _arrivalDate: Date,
	) {}

	static create(productId: EntityId, quantity: number, arrivalDate: Date) {
		return new ProductDelivery(productId, quantity, arrivalDate)
	}

	public get arrivalDate(): Date {
		return this._arrivalDate
	}
	public get quantity(): number {
		return this._quantity
	}
	public get productId(): EntityId {
		return this._productId
	}
}
