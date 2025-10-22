import { ValueException } from "../../../../core/exceptions/ValueException.js"
import {
	AggregateRoot,
	EntityAction,
} from "../../../../core/interfaces/AggregateRoot.js"
import { EntityCollection } from "../../../../core/types/EntityCollection.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { ProductIsAlreadySuppliedException } from "../../exceptions/ProductIsAlreadySuppliedException.js"
import { SuppliedProductNotFound } from "../../exceptions/SuppliedProductNotFound.js"
import { SuppliedProduct } from "../supplied_product/SuppliedProduct.js"
import { SuppliedProductMax } from "../supplied_product/value_objects/SuppliedProductMax.js"
import { SuppliedProductMin } from "../supplied_product/value_objects/SuppliedProductMin.js"
import { LeadTime } from "./value_objects/LeadTime.js"
import { SupplierName } from "./value_objects/SupplierName.js"

export type UpdateSupplierFields = Partial<{
	name: SupplierName
	leadTime: LeadTime
}>

export class Supplier extends AggregateRoot {
	private constructor(
		id: EntityId,
		private accountId: EntityId,
		private name: SupplierName,
		private leadTime: LeadTime,
		private createdAt: Date,
		private updatedAt: Date,
		private deletedAt: Date | null,
		private suppliedProducts: EntityCollection<SuppliedProduct>,
	) {
		super(id)
	}

	static create(params: {
		id: EntityId
		accountId: EntityId
		name: SupplierName
		leadTime: LeadTime
		createdAt: Date
		updatedAt: Date
		deletedAt: Date | null
		productsSupplied: EntityCollection<SuppliedProduct>
	}) {
		return new Supplier(
			params.id,
			params.accountId,
			params.name,
			params.leadTime,
			params.createdAt,
			params.updatedAt,
			params.deletedAt,
			params.productsSupplied,
		)
	}

	addSuppliedProduct(
		id: EntityId,
		productId: EntityId,
		max: SuppliedProductMax,
		min: SuppliedProductMax,
		isDefault: boolean,
	) {
		const suppliedProduct = SuppliedProduct.create({
			id,
			max,
			min,
			productId,
			supplierId: this.id,
			isDefault,
		})
		for (const supplied of this.suppliedProducts.values()) {
			if (supplied.getProductId() === suppliedProduct.getProductId()) {
				throw new ProductIsAlreadySuppliedException()
			}
		}
		this.suppliedProducts.set(
			suppliedProduct.getProductId(),
			suppliedProduct,
		)
		this.addTrackedEntity(suppliedProduct, EntityAction.created)
	}

	removeSuppliedProduct(productId: EntityId) {
		const deleted = this.suppliedProducts.get(productId)
		if (!deleted) {
			throw new SuppliedProductNotFound()
		}
		this.suppliedProducts.delete(productId)
		this.addTrackedEntity(deleted, EntityAction.deleted)
	}

	updateSuppliedProduct(
		productId: EntityId,
		fields: Partial<{
			max: SuppliedProductMax
			min: SuppliedProductMin
			isDefault: boolean
		}>,
	) {
		const toBeUpdated = this.suppliedProducts.get(productId)
		if (!toBeUpdated) {
			throw new SuppliedProductNotFound()
		}

		if (fields.max !== undefined) toBeUpdated.setMax(fields.max)
		if (fields.min !== undefined) toBeUpdated.setMin(fields.min)
		if (fields.isDefault !== undefined)
			toBeUpdated.setIsDefault(fields.isDefault)

		if (toBeUpdated.getMax().value <= toBeUpdated.getMin().value) {
			throw new ValueException(
				"Supplied product's max cannot be smaller or equal to min",
			)
		}

		this.addTrackedEntity(toBeUpdated, EntityAction.updated)
	}

	archive() {
		this.deletedAt = new Date()
		this.addTrackedEntity(this, EntityAction.deleted)
	}

	public getSuppliedProducts(): EntityCollection<SuppliedProduct> {
		return this.suppliedProducts
	}
	public setSuppliedProducts(value: EntityCollection<SuppliedProduct>) {
		this.suppliedProducts = value
	}
	public getDeletedAt(): Date | null {
		return this.deletedAt
	}
	public setDeletedAt(value: Date | null) {
		this.deletedAt = value
	}
	public getUpdatedAt(): Date {
		return this.updatedAt
	}
	public setUpdatedAt(value: Date) {
		this.updatedAt = value
	}
	public getCreatedAt(): Date {
		return this.createdAt
	}
	public setCreatedAt(value: Date) {
		this.createdAt = value
	}
	public getLeadTime(): LeadTime {
		return this.leadTime
	}
	public setLeadTime(value: LeadTime) {
		this.leadTime = value
	}
	public getName(): SupplierName {
		return this.name
	}
	public setName(value: SupplierName) {
		this.name = value
	}
	public getAccountId(): EntityId {
		return this.accountId
	}
	public setAccountId(value: EntityId) {
		this.accountId = value
	}
}
