import { InvalidEntityCreated } from "../../../../core/exceptions/InvalidEntityCreated.js"
import { ResourceIsArchivedException } from "../../../../core/exceptions/ResourceIsArchivedException.js"
import { ValueException } from "../../../../core/exceptions/ValueException.js"
import {
	AggregateRoot,
	EntityAction,
} from "../../../../core/interfaces/AggregateRoot.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { SaleArchivedEvent } from "../../events/SaleArchivedEvent.js"
import { SaleQuantityDecremented } from "../../events/SaleQuantityDecremented.js"
import { SaleQuantityIncremented } from "../../events/SaleQuantityIncremented.js"
import { SaleQuantity } from "./value_objects/SaleQuantity.js"
import { SaleStatus } from "./value_objects/SaleStatus.js"

export type SaleUpdateableFields = Partial<{
	quantity: SaleQuantity
	status: SaleStatus
	date: Date
}>

export class Sale extends AggregateRoot {
	private accountId: EntityId
	private productId: EntityId
	private quantity: SaleQuantity
	private status: SaleStatus
	private date: Date
	private createdAt: Date
	private updatedAt: Date
	private deletedAt: Date | null

	getAccountId(): EntityId {
		return this.accountId
	}
	setAccountId(value: EntityId) {
		this.throwIfArchived()
		this.accountId = value
	}

	getProductId(): EntityId {
		return this.productId
	}

	getQuantity(): SaleQuantity {
		return this.quantity
	}
	setQuantity(value: SaleQuantity) {
		this.throwIfArchived()
		if (this.quantity.value < value.value) {
			this.addDomainEvent(
				new SaleQuantityIncremented(
					this.productId,
					value.value - this.quantity.value,
				),
			)
		} else if (this.quantity.value > value.value) {
			this.addDomainEvent(
				new SaleQuantityDecremented(
					this.productId,
					this.quantity.value - value.value,
				),
			)
		}
		this.quantity = value
	}

	getStatus(): SaleStatus {
		return this.status
	}
	setStatus(value: SaleStatus) {
		const originalStatus = this.status.value
		if (
			(originalStatus === "cancelled" || originalStatus === "pending") &&
			value.value === "completed"
		) {
			this.addDomainEvent(
				new SaleQuantityIncremented(
					this.productId,
					this.quantity.value,
				),
			)
		} else if (
			originalStatus === "completed" &&
			(this.status.value === "cancelled" ||
				this.status.value === "pending")
		) {
			this.addDomainEvent(
				new SaleQuantityDecremented(
					this.productId,
					this.quantity.value,
				),
			)
		}
		this.throwIfArchived()
		this.status = value
	}

	getDate(): Date {
		return this.date
	}
	setDate(value: Date) {
		this.throwIfArchived()
		this.date = value
	}

	getCreatedAt(): Date {
		return this.createdAt
	}

	getUpdatedAt(): Date {
		return this.updatedAt
	}
	setUpdatedAt(value: Date) {
		this.throwIfArchived()
		this.updatedAt = value
	}

	getDeletedAt(): Date | null {
		return this.deletedAt
	}

	private constructor(
		id: EntityId,
		accountId: EntityId,
		productId: EntityId,
		quantity: SaleQuantity,
		status: SaleStatus,
		date: Date,
		createdAt: Date,
		updatedAt: Date,
		deletedAt: Date | null,
	) {
		super(id)
		this.accountId = accountId
		this.productId = productId
		this.quantity = quantity
		this.status = status
		this.date = date
		this.createdAt = createdAt
		this.updatedAt = updatedAt
		this.deletedAt = deletedAt
	}

	static create(params: {
		id: EntityId
		accountId: EntityId
		productId: EntityId
		quantity: SaleQuantity
		status: SaleStatus
		date: Date
		createdAt: Date
		updatedAt: Date
		deletedAt: Date | null
	}): Sale {
		try {
			const sale = new Sale(
				params.id,
				params.accountId,
				params.productId,
				params.quantity,
				params.status,
				params.date,
				params.createdAt,
				params.updatedAt,
				params.deletedAt,
			)
			return sale
		} catch (error) {
			throw new InvalidEntityCreated(error as ValueException)
		}
	}
	archive() {
		this.throwIfArchived()
		this.deletedAt = new Date()
		this.addDomainEvent(new SaleArchivedEvent(this.getProductId(), this.id))
		this.addTrackedEntity(this, EntityAction.updated)
	}

	delete() {
		this.addTrackedEntity(this, EntityAction.deleted)
	}

	throwIfArchived() {
		if (this.deletedAt) {
			throw new ResourceIsArchivedException("sale")
		}
	}
}

export type UpdateSaleInput = Partial<{
	saleId: EntityId
	date: Date
	quantity: number
	status: string
}>
