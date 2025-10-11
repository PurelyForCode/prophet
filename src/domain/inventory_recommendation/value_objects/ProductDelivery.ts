import { EntityId } from "../../../core/types/EntityId.js"

export class ProductDelivery {
	private constructor(
		private readonly _productId: EntityId,
		private readonly _quantity: number,
		private readonly _date: Date,
	) {}

	static create(productId: EntityId, quantity: number, date: Date) {
		return new ProductDelivery(productId, quantity, date)
	}

	public get date(): Date {
		return this._date
	}
	public get quantity(): number {
		return this._quantity
	}
	public get productId(): EntityId {
		return this._productId
	}
}
