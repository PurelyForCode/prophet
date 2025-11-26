import { Entity } from "../../../../core/interfaces/Entity.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { ProductName } from "./value_objects/ProductName.js"
import { ProductSetting } from "./value_objects/ProductSetting.js"
import { ProductStock } from "./value_objects/ProductStock.js"
import { SafetyStock } from "./value_objects/SafetyStock.js"
import { SaleCount } from "./value_objects/SaleCount.js"

export type UpdateProductFields = Partial<{
	safetyStock: SafetyStock
	name: ProductName
	stock: ProductStock
	settings: ProductSetting
	updatedAt: Date
}>

export class Product extends Entity {
	updateSetting(setting: ProductSetting) {
		this.settings = setting
	}

	private constructor(
		id: EntityId,
		private _productGroupId: EntityId,
		private _accountId: EntityId,
		private _name: ProductName,
		private _stock: ProductStock,
		private _safetyStock: SafetyStock,
		private _saleCount: SaleCount,
		private _settings: ProductSetting,
		private _createdAt: Date,
		private _updatedAt: Date,
		private _deletedAt: Date | null,
	) {
		super(id)
		this._accountId = _accountId
		this._productGroupId = _productGroupId
		this._name = _name
		this._stock = _stock
		this._safetyStock = _safetyStock
		this._saleCount = _saleCount
		this._settings = _settings
		this._createdAt = _createdAt
		this._updatedAt = _updatedAt
		this._deletedAt = _deletedAt
	}

	public static create(params: {
		id: EntityId
		productGroupId: EntityId
		accountId: EntityId
		name: ProductName
		stock: ProductStock
		safetyStock: SafetyStock
		saleCount: SaleCount
		settings: ProductSetting
		createdAt: Date
		updatedAt: Date
		deletedAt: Date | null
	}) {
		return new Product(
			params.id,
			params.productGroupId,
			params.accountId,
			params.name,
			params.stock,
			params.safetyStock,
			params.saleCount,
			params.settings,
			params.createdAt,
			params.updatedAt,
			params.deletedAt,
		)
	}

	public get saleCount(): SaleCount {
		return this._saleCount
	}
	public set saleCount(value: SaleCount) {
		this._saleCount = value
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
	public get settings(): ProductSetting {
		return this._settings
	}
	public set settings(value: ProductSetting) {
		this._settings = value
	}
	public get safetyStock(): SafetyStock {
		return this._safetyStock
	}
	public set safetyStock(value: SafetyStock) {
		this._safetyStock = value
	}
	public get stock(): ProductStock {
		return this._stock
	}
	public set stock(value: ProductStock) {
		this._stock = value
	}
	public get name(): ProductName {
		return this._name
	}
	public set name(value: ProductName) {
		this._name = value
	}
	public get accountId(): EntityId {
		return this._accountId
	}
	public set accountId(value: EntityId) {
		this._accountId = value
	}
	public get productGroupId(): EntityId {
		return this._productGroupId
	}
	public set productGroupId(value: EntityId) {
		this._productGroupId = value
	}
}
