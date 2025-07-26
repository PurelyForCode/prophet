import { Entity } from "../../../../core/interfaces/Entity.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { ProductName } from "../product/value_objects/ProductName.js";
import { ProductSetting } from "../product/value_objects/ProductSetting.js";
import { ProductStock } from "../product/value_objects/ProductStock.js";
import { SafetyStock } from "../product/value_objects/SafetyStock.js";

export type VariantUpdateableFields = Partial<{
  safetyStock: SafetyStock;
  name: ProductName;
  stock: ProductStock;
  settings: ProductSetting;
}>;

export class Variant extends Entity {
  private readonly _productId: EntityId;
  private _accountId: EntityId;
  private _name: ProductName;
  private _stock: ProductStock;
  private _safetyStock: SafetyStock;
  private _settings: ProductSetting;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _deletedAt: Date | null;

  public get deletedAt(): Date | null {
    return this._deletedAt;
  }
  public set deletedAt(value: Date | null) {
    this._deletedAt = value;
  }
  public get settings(): ProductSetting {
    return this._settings;
  }
  public set settings(value: ProductSetting) {
    this._settings = value;
  }
  public get safetyStock(): SafetyStock {
    return this._safetyStock;
  }
  public set safetyStock(value: SafetyStock) {
    this._safetyStock = value;
  }
  public get productId(): EntityId {
    return this._productId;
  }
  public get name(): ProductName {
    return this._name;
  }
  public set name(value: ProductName) {
    this._name = value;
  }
  public get stock(): ProductStock {
    return this._stock;
  }
  public set stock(value: ProductStock) {
    this._stock = value;
  }
  public get createdAt(): Date {
    return this._createdAt;
  }
  public set createdAt(value: Date) {
    this._createdAt = value;
  }
  public get updatedAt(): Date {
    return this._updatedAt;
  }
  public set updatedAt(value: Date) {
    this._updatedAt = value;
  }
  public get accountId(): EntityId {
    return this._accountId;
  }
  public set accountId(value: EntityId) {
    this._accountId = value;
  }

  private constructor(
    id: EntityId,
    productId: EntityId,
    accountId: EntityId,
    name: ProductName,
    stock: ProductStock,
    safetyStock: SafetyStock,
    settings: ProductSetting,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null
  ) {
    super(id);
    this._productId = productId;
    this._accountId = accountId;
    this._name = name;
    this._stock = stock;
    this._safetyStock = safetyStock;
    this._settings = settings;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._deletedAt = deletedAt;
  }

  public static create(
    id: EntityId,
    productId: EntityId,
    accountId: EntityId,
    name: ProductName,
    stock: ProductStock,
    safetyStock: SafetyStock,
    settings: ProductSetting,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null
  ): Variant {
    return new Variant(
      id,
      productId,
      accountId,
      name,
      stock,
      safetyStock,
      settings,
      createdAt,
      updatedAt,
      deletedAt
    );
  }

  archive() {
    this.deletedAt = new Date();
  }
  delete() {}
}
