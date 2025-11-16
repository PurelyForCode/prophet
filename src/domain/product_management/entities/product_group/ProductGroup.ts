import { freeze } from "immer"
import { ResourceIsArchivedException } from "../../../../core/exceptions/ResourceIsArchivedException.js"
import {
	AggregateRoot,
	EntityAction,
} from "../../../../core/interfaces/AggregateRoot.js"
import { EntityCollection } from "../../../../core/types/EntityCollection.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { DuplicateVariantNameException } from "../../exceptions/DuplicateVariantNameException.js"
import { ProductGroupAlreadyInCategoryException } from "../../exceptions/ProductGroupAlreadyInCategoryException.js"
import { ProductGroupIsNotInACategoryException } from "../../exceptions/ProductGroupIsNotInACategoryException.js"
import { ProductNotFoundException } from "../../exceptions/ProductNotFoundException.js"
import { Product, UpdateProductFields } from "../product/Product.js"
import { ProductName } from "../product/value_objects/ProductName.js"
import { ProductSetting } from "../product/value_objects/ProductSetting.js"
import { ProductStock } from "../product/value_objects/ProductStock.js"
import { SafetyStock } from "../product/value_objects/SafetyStock.js"
import { DuplicateProductNameException } from "../../exceptions/DuplicateNameException.js"
import { ResourceIsNotArchivedException } from "../../../../core/exceptions/ResourceIsNotArchivedException.js"
import { SaleCount } from "../product/value_objects/SaleCount.js"

export type UpdateProductGroupFields = Partial<{
	name: ProductName
}>

export class ProductGroup extends AggregateRoot {
	public get accountId(): EntityId {
		return this._accountId
	}
	public set accountId(value: EntityId) {
		this._accountId = value
	}
	public get deletedAt(): Date | null {
		return this._deletedAt
	}
	public set deletedAt(value: Date | null) {
		this._deletedAt = value
	}
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
	public get name(): ProductName {
		return this._name
	}
	public set name(value: ProductName) {
		this._name = value
	}
	public get categoryId(): EntityId | null {
		return this._categoryId
	}
	public set categoryId(value: EntityId | null) {
		this._categoryId = value
	}

	private constructor(
		id: EntityId,
		private _categoryId: EntityId | null,
		private _accountId: EntityId,
		private _name: ProductName,
		private _createdAt: Date,
		private _updatedAt: Date,
		private _deletedAt: Date | null,
		private products: EntityCollection<Product>,
	) {
		super(id)
	}

	static create(params: {
		id: EntityId
		categoryId: EntityId | null
		accountId: EntityId
		name: ProductName
		createdAt: Date
		updatedAt: Date
		deletedAt: Date | null
		products: EntityCollection<Product>
	}) {
		return new ProductGroup(
			params.id,
			params.categoryId,
			params.accountId,
			params.name,
			params.createdAt,
			params.updatedAt,
			params.deletedAt,
			params.products,
		)
	}

	addVariant(
		id: EntityId,
		accountId: EntityId,
		name: ProductName,
		stock: ProductStock,
		setting: ProductSetting | undefined,
	) {
		this.throwIfArchived()
		const products = this.products.values()
		for (const p of products) {
			if (p.name.value === name.value) {
				throw new DuplicateVariantNameException()
			}
		}

		const now = new Date()
		let definedSetting = setting
		if (definedSetting === undefined) {
			definedSetting = ProductSetting.defaultConfiguration(now)
		}

		const product = Product.create({
			id: id,
			productGroupId: this.id,
			accountId: accountId,
			name: name,
			stock: stock,
			safetyStock: new SafetyStock(0),
			saleCount: new SaleCount(0),
			createdAt: now,
			deletedAt: null,
			updatedAt: now,
			settings: definedSetting,
		})

		this.products.set(product.id, product)
		this.addTrackedEntity(product, EntityAction.created)
		return product
	}

	getVariant(productId: EntityId): null | Product {
		const product = this.products.get(productId)
		if (!product) {
			return null
		}
		return product
	}

	updateVariant(productId: EntityId, fields: UpdateProductFields) {
		this.throwIfArchived()
		const now = new Date()
		const product = this.products.get(productId)
		if (!product) {
			throw new ProductNotFoundException()
		}
		if (product.deletedAt) {
			throw new ResourceIsArchivedException("Product")
		}

		if (fields.name) {
			for (const product of this.products.values()) {
				if (product.name === fields.name) {
					throw new DuplicateProductNameException()
				}
			}
			product.name = fields.name
		}
		fields.stock && (product.stock = fields.stock)
		fields.safetyStock && (product.safetyStock = fields.safetyStock)
		fields.settings && (product.settings = fields.settings)
		product.updatedAt = now
		this.addTrackedEntity(product, EntityAction.updated)
	}

	archiveVariant(productId: EntityId) {
		const product = this.products.get(productId)
		if (!product) {
			throw new ProductNotFoundException()
		}
		product.deletedAt = new Date()
		this.addTrackedEntity(product, EntityAction.updated)
	}

	removeVariant(productId: EntityId) {
		const removed = this.products.get(productId)
		if (!removed) {
			throw new ProductNotFoundException()
		}
		this.products.delete(removed.id)
		this.addTrackedEntity(removed, EntityAction.deleted)
	}

	archive() {
		for (const product of this.products.values()) {
			this.archiveVariant(product.id)
			this.addTrackedEntity(product, EntityAction.updated)
		}
		this.deletedAt = new Date()
		this.addTrackedEntity(this, EntityAction.updated)
	}

	delete() {
		this.addTrackedEntity(this, EntityAction.deleted)
	}

	joinCategory(categoryId: EntityId) {
		if (this.categoryId === categoryId) {
			throw new ProductGroupAlreadyInCategoryException()
		}
		this.categoryId = categoryId
		this.addTrackedEntity(this, EntityAction.updated)
	}

	leaveCategory() {
		if (!this.categoryId) {
			throw new ProductGroupIsNotInACategoryException()
		}
		this.categoryId = null
		this.addTrackedEntity(this, EntityAction.updated)
	}

	unarchive() {
		this.deletedAt = null
		for (const product of this.products.values()) {
			this.unarchiveVariant(product.id)
			this.addTrackedEntity(product, EntityAction.updated)
		}
		this.addTrackedEntity(this, EntityAction.updated)
	}

	unarchiveVariant(productId: EntityId) {
		const product = this.products.get(productId)
		if (!product) {
			throw new ProductNotFoundException()
		}
		if (product.deletedAt === null) {
			throw new ResourceIsNotArchivedException("product")
		}
		product.deletedAt = null
	}

	private throwIfArchived() {
		if (this.deletedAt) {
			throw new ResourceIsArchivedException("product")
		}
	}
}
