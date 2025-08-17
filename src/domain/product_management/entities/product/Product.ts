import { ResourceIsArchivedException } from "../../../../core/exceptions/ResourceIsArchivedException.js";
import {
  AggregateRoot,
  EntityAction,
} from "../../../../core/interfaces/AggregateRoot.js";
import { EntityCollection } from "../../../../core/types/EntityCollection.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { DuplicateVariantNameException } from "../../exceptions/DuplicateVariantNameException.js";
import { VariantNotFoundException } from "../../exceptions/VariantNotFoundException.js";
import { Variant, VariantUpdateableFields } from "../variant/Variant.js";
import { ProductName } from "./value_objects/ProductName.js";
import { ProductSetting } from "./value_objects/ProductSetting.js";
import { ProductStock } from "./value_objects/ProductStock.js";
import { SafetyStock } from "./value_objects/SafetyStock.js";

export type UpdateProductFields = Partial<{
  safetyStock: SafetyStock;
  name: ProductName;
  stock: ProductStock;
  settings: ProductSetting;
  updatedAt: Date;
}>;

export class Product extends AggregateRoot {
  private productCategoryId: EntityId | null;
  private accountId: EntityId;
  private name: ProductName;
  private stock: ProductStock;
  private safetyStock: SafetyStock;
  private createdAt: Date;
  private updatedAt: Date;
  private deletedAt: Date | null;
  private variants: EntityCollection<Variant>;
  private settings: ProductSetting;

  private constructor(
    id: EntityId,
    accountId: EntityId,
    productCategoryId: EntityId | null,
    name: ProductName,
    stock: ProductStock,
    safetyStock: SafetyStock,
    settings: ProductSetting,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null,
    variants: EntityCollection<Variant>
  ) {
    super(id);
    this.accountId = accountId;
    this.productCategoryId = productCategoryId;
    this.variants = variants;
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
    accountId: EntityId;
    productCategoryId: EntityId | null;
    name: ProductName;
    stock: ProductStock;
    safetyStock: SafetyStock;
    settings: ProductSetting;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    variants: EntityCollection<Variant>;
  }) {
    return new Product(
      params.id,
      params.accountId,
      params.productCategoryId,
      params.name,
      params.stock,
      params.safetyStock,
      params.settings,
      params.createdAt,
      params.updatedAt,
      params.deletedAt,
      params.variants
    );
  }

  getName() {
    return this.name;
  }
  setName(name: ProductName) {
    this.name = name;
  }
  setStock(stock: ProductStock) {
    this.stock = stock;
  }
  getStock() {
    return this.stock;
  }
  setSafetyStock(safetyStock: SafetyStock) {
    this.safetyStock = safetyStock;
  }
  getSafetyStock() {
    return this.safetyStock;
  }
  setUpdatedAt(date: Date) {
    this.updatedAt = date;
  }
  getUpdatedAt() {
    return this.updatedAt;
  }

  getDeletedAt() {
    return this.deletedAt;
  }

  addVariant(
    id: EntityId,
    accountId: EntityId,
    name: ProductName,
    stock: ProductStock
  ) {
    this.throwIfArchived();
    const variants = this.variants.values();
    for (const v of variants) {
      if (v.getName().value === name.value) {
        throw new DuplicateVariantNameException();
      }
    }
    const now = new Date();
    const parentSetting = new ProductSetting(
      this.settings.serviceLevel,
      this.settings.safetyStockCalculationMethod,
      this.settings.classification,
      this.settings.fillRate,
      now
    );
    const variant = Variant.create(
      id,
      this.id,
      accountId,
      name,
      stock,
      new SafetyStock(0),
      parentSetting,
      now,
      now,
      null
    );

    this.variants.set(variant.id, variant);
    this.addTrackedEntity(variant, EntityAction.created);
    return variant;
  }

  updateVariant(variantId: EntityId, fields: VariantUpdateableFields) {
    this.throwIfArchived();
    const now = new Date();
    const variant = this.variants.get(variantId);
    if (!variant) {
      throw new VariantNotFoundException();
    }
    fields.name && variant.setName(fields.name);
    fields.stock && variant.setStock(fields.stock);
    fields.safetyStock && variant.setSafetyStock(fields.safetyStock);
    fields.settings && variant.setSettings(fields.settings);
    variant.setUpdatedAt(now);
    this.addTrackedEntity(variant, EntityAction.updated);
  }

  removeVariant(variantId: EntityId) {
    this.throwIfArchived();
    const variant = this.variants.get(variantId);
    if (!variant) {
      throw new VariantNotFoundException();
    }
    this.variants.delete(variantId);
    this.addTrackedEntity(variant, EntityAction.deleted);
  }

  archiveVariant(variantId: EntityId) {
    this.throwIfArchived();
    const variant = this.variants.get(variantId);
    if (!variant) {
      throw new VariantNotFoundException();
    }
    variant.archive();
    this.addTrackedEntity(variant, EntityAction.updated);
  }

  updateSetting(setting: ProductSetting) {
    this.throwIfArchived();
    this.settings = setting;
    this.addTrackedEntity(this, EntityAction.updated);
  }

  archive() {
    this.throwIfArchived();
    this.deletedAt = new Date();
    this.addTrackedEntity(this, EntityAction.updated);
  }

  delete() {
    this.addTrackedEntity(this, EntityAction.deleted);
  }

  throwIfArchived() {
    if (this.deletedAt) {
      throw new ResourceIsArchivedException("Product");
    }
  }
}
