import { Entity } from "../../../../core/interfaces/Entity.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { SuppliedProductMax } from "./value_objects/SuppliedProductMax.js"
import { SuppliedProductMin } from "./value_objects/SuppliedProductMin.js"

export class SuppliedProduct extends Entity {
	private constructor(
		id: EntityId,
		private productId: EntityId,
		private supplierId: EntityId,
		private min: SuppliedProductMin,
		private max: SuppliedProductMax,
		private isDefault: boolean,
	) {
		super(id)
	}

	static create(params: {
		id: EntityId
		productId: EntityId
		supplierId: EntityId
		min: SuppliedProductMin
		max: SuppliedProductMax
		isDefault: boolean
	}) {
		return new SuppliedProduct(
			params.id,
			params.productId,
			params.supplierId,
			params.min,
			params.max,
			params.isDefault,
		)
	}

	getMax(): SuppliedProductMax {
		return this.max
	}
	setMax(value: SuppliedProductMax) {
		this.max = value
	}

	getMin(): SuppliedProductMin {
		return this.min
	}
	setMin(value: SuppliedProductMin) {
		this.min = value
	}
	getSupplierId(): EntityId {
		return this.supplierId
	}
	setSupplierId(value: EntityId) {
		this.supplierId = value
	}
	getProductId(): EntityId {
		return this.productId
	}
	setProductId(value: EntityId) {
		this.productId = value
	}

	getIsDefault() {
		return this.isDefault
	}

	setIsDefault(value: boolean) {
		this.isDefault = value
	}
}
