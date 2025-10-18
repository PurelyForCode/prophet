import {
	AggregateRoot,
	EntityAction,
} from "../../../../core/interfaces/AggregateRoot.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { CategoryName } from "./value_objects/CategoryName.js"

export type UpdateCategoryFields = Partial<{ name: CategoryName }>
export class Category extends AggregateRoot {
	private constructor(
		id: EntityId,
		private accountId: EntityId,
		private name: CategoryName,
		private createdAt: Date,
		private updatedAt: Date,
		private deletedAt: Date | null,
	) {
		super(id)
	}

	public static create(params: {
		id: EntityId
		accountId: EntityId
		name: CategoryName
		createdAt: Date
		updatedAt: Date
		deletedAt: Date | null
	}) {
		return new Category(
			params.id,
			params.accountId,
			params.name,
			params.createdAt,
			params.updatedAt,
			params.deletedAt,
		)
	}

	getDeletedAt(): Date | null {
		return this.deletedAt
	}
	getUpdatedAt(): Date {
		return this.updatedAt
	}
	setUpdatedAt(value: Date) {
		this.updatedAt = value
	}
	getCreatedAt(): Date {
		return this.createdAt
	}
	setCreatedAt(value: Date) {
		this.createdAt = value
	}
	getName(): CategoryName {
		return this.name
	}
	setName(value: CategoryName) {
		this.name = value
	}
	getAccountId(): EntityId {
		return this.accountId
	}
	setAccountId(value: EntityId) {
		this.accountId = value
	}
	archive() {
		this.deletedAt = new Date()
		this.addTrackedEntity(this, EntityAction.updated)
	}
	delete() {
		this.addTrackedEntity(this, EntityAction.deleted)
	}
}
