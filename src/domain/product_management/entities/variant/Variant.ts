import { ResourceIsArchivedException } from "../../../../core/exceptions/ResourceIsArchivedException.js";
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
  private productId: EntityId;
  private productCategoryId: EntityId | null;
  private accountId: EntityId;
  private name: ProductName;
  private stock: ProductStock;
  private safetyStock: SafetyStock;
  private createdAt: Date;
  private updatedAt: Date;
  private deletedAt: Date | null;
  private settings: ProductSetting;

  getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  getSettings(): ProductSetting {
    return this.settings;
  }
  setSettings(value: ProductSetting) {
    this.throwIfArchived();
    this.settings = value;
  }
  getSafetyStock(): SafetyStock {
    return this.safetyStock;
  }
  setSafetyStock(value: SafetyStock) {
    this.throwIfArchived();
    this.safetyStock = value;
  }
  getProductId(): EntityId {
    return this.productId;
  }
  getName(): ProductName {
    return this.name;
  }
  setName(value: ProductName) {
    this.throwIfArchived();
    this.name = value;
  }
  getStock(): ProductStock {
    return this.stock;
  }
  setStock(value: ProductStock) {
    this.throwIfArchived();
    this.stock = value;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }
  setCreatedAt(value: Date) {
    this.throwIfArchived();
    this.createdAt = value;
  }
  getUpdatedAt(): Date {
    return this.updatedAt;
  }
  setUpdatedAt(value: Date) {
    this.throwIfArchived();
    this.updatedAt = value;
  }
  getAccountId(): EntityId {
    return this.accountId;
  }
  setAccountId(value: EntityId) {
    this.throwIfArchived();
    this.accountId = value;
  }

  private constructor(
    id: EntityId,
    productId: EntityId,
    productCategoryId: EntityId | null,
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
    this.productId = productId;
    this.productCategoryId = productCategoryId;
    this.accountId = accountId;
    this.name = name;
    this.stock = stock;
    this.safetyStock = safetyStock;
    this.settings = settings;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  public static create(params: {
    id: EntityId;
    productId: EntityId;
    productCategoryId: EntityId | null;
    accountId: EntityId;
    name: ProductName;
    stock: ProductStock;
    safetyStock: SafetyStock;
    settings: ProductSetting;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): Variant {
    return new Variant(
      params.id,
      params.productId,
      params.productCategoryId,
      params.accountId,
      params.name,
      params.stock,
      params.safetyStock,
      params.settings,
      params.createdAt,
      params.updatedAt,
      params.deletedAt
    );
  }

  archive() {
    this.throwIfArchived();
    this.deletedAt = new Date();
  }

  throwIfArchived() {
    if (this.deletedAt) {
      throw new ResourceIsArchivedException("Product");
    }
  }
}
