import { ResourceIsArchivedException } from "../../../../core/exceptions/ResourceIsArchivedException.js";
import {
  AggregateRoot,
  EntityAction,
} from "../../../../core/interfaces/AggregateRoot.js";
import { EntityCollection } from "../../../../core/types/EntityCollection.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { DuplicateVariantNameException } from "../../exceptions/DuplicateVariantNameException.js";
import { ProductNotInCategoryException } from "../../exceptions/ProductNotInCategoryException.js";
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

  getProductCategoryId(): EntityId | null {
    return this.productCategoryId;
  }
  setProductCategoryId(value: EntityId | null) {
    this.productCategoryId = value;
  }
  getAccountId(): EntityId {
    return this.accountId;
  }
  setAccountId(value: EntityId) {
    this.accountId = value;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }
  setCreatedAt(value: Date) {
    this.createdAt = value;
  }
  getName() {
    return this.name;
  }
  setName(name: ProductName) {
    this.throwIfArchived();
    this.name = name;
  }
  getStock() {
    return this.stock;
  }
  setStock(stock: ProductStock) {
    this.throwIfArchived();
    this.stock = stock;
  }
  getSafetyStock() {
    return this.safetyStock;
  }
  setSafetyStock(safetyStock: SafetyStock) {
    this.throwIfArchived();
    if (this.settings.safetyStockCalculationMethod === "manual")
      this.safetyStock = safetyStock;
  }
  getUpdatedAt() {
    return this.updatedAt;
  }
  setUpdatedAt(date: Date) {
    this.throwIfArchived();
    this.updatedAt = date;
  }
  getDeletedAt() {
    return this.deletedAt;
  }
  getSetting() {
    return this.settings;
  }

  getVariants() {
    return this.variants;
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

    const variant = Variant.create({
      accountId: accountId,
      createdAt: now,
      deletedAt: null,
      id: id,
      name: name,
      productCategoryId: this.productCategoryId,
      productId: this.id,
      safetyStock: this.safetyStock,
      settings: parentSetting,
      stock: stock,
      updatedAt: now,
    });

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

  addToCategory(categoryId: EntityId) {
    this.setProductCategoryId(categoryId);
    this.addTrackedEntity(this, EntityAction.updated);
    this.variants.forEach((variant) => {
      variant.setProductCategoryId(categoryId);
      this.addTrackedEntity(variant, EntityAction.updated);
    });
  }

  removeInCategory() {
    if (this.getProductCategoryId() === null) {
      throw new ProductNotInCategoryException();
    }

    this.setProductCategoryId(null);
    this.addTrackedEntity(this, EntityAction.updated);
    this.variants.forEach((variant) => {
      variant.setProductCategoryId(null);
      this.addTrackedEntity(variant, EntityAction.updated);
    });
  }
}
