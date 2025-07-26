import { fi } from "zod/locales";
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
import {
  ProductSetting,
  UpdateProductSettingFields,
} from "./value_objects/ProductSetting.js";
import { ProductStock } from "./value_objects/ProductStock.js";
import { SafetyStock } from "./value_objects/SafetyStock.js";
import { Entity } from "../../../../core/interfaces/Entity.js";

export type UpdateProductFields = Partial<{
  safetyStock: number;
  name: string;
  stock: number;
  settings: UpdateProductSettingFields;
}>;

export class Product extends AggregateRoot {
  private _productCategoryId: EntityId | null;
  private _accountId: EntityId;
  private _name: ProductName;
  private _stock: ProductStock;
  private _safetyStock: SafetyStock;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _deletedAt: Date | null;
  // controlled
  private _variants: EntityCollection<Variant>;
  private _settings: ProductSetting;

  public get productCategoryId(): EntityId | null {
    return this._productCategoryId;
  }
  public set productCategoryId(value: EntityId | null) {
    this._productCategoryId = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }
  public get accountId(): EntityId {
    return this._accountId;
  }
  public set accountId(value: EntityId) {
    this._accountId = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }
  public get name(): ProductName {
    return this._name;
  }
  public set name(value: ProductName) {
    this._name = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }
  public get stock(): ProductStock {
    return this._stock;
  }
  public set stock(value: ProductStock) {
    this._stock = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }
  public get safetyStock(): SafetyStock {
    return this._safetyStock;
  }
  public set safetyStock(value: SafetyStock) {
    this._safetyStock = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }
  public get variants(): EntityCollection<Variant> {
    return this._variants;
  }
  public get settings(): ProductSetting {
    return this._settings;
  }
  public set settings(value: ProductSetting) {
    this._settings = value;
    this.addTrackedEntity(this, EntityAction.updated);
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
  public get deletedAt(): Date | null {
    return this._deletedAt;
  }
  public set deletedAt(value: Date | null) {
    this._deletedAt = value;
  }

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
    this._accountId = accountId;
    this._productCategoryId = productCategoryId;
    this._variants = variants;
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
    return new Product(
      id,
      accountId,
      productCategoryId,
      name,
      stock,
      safetyStock,
      settings,
      createdAt,
      updatedAt,
      deletedAt,
      variants
    );
  }

  addVariant(
    id: EntityId,
    accountId: EntityId,
    name: ProductName,
    stock: ProductStock
  ) {
    if (this.deletedAt) {
      throw new ResourceIsArchivedException("Product");
    }
    const variants = this.variants.values();
    for (const v of variants) {
      if (v.name.value === name.value) {
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
    const variant = this.variants.get(variantId);
    if (!variant) {
      throw new VariantNotFoundException();
    }
    fields.name && (variant.name = fields.name);
    fields.stock && (variant.stock = fields.stock);
    fields.safetyStock && (variant.safetyStock = fields.safetyStock);
    fields.settings && (variant.settings = fields.settings);
    variant.updatedAt = new Date();
    this.addTrackedEntity(variant, EntityAction.updated);
  }

  deleteVariant(variantId: EntityId) {
    const variant = this.variants.get(variantId);
    if (!variant) {
      throw new VariantNotFoundException();
    }
    this.variants.delete(variantId);
    variant.delete();
    this.addTrackedEntity(variant, EntityAction.deleted);
  }

  archiveVariant(variantId: EntityId) {
    const variant = this.variants.get(variantId);
    if (!variant) {
      throw new VariantNotFoundException();
    }
    variant.archive();
    this.addTrackedEntity(variant, EntityAction.updated);
  }

  updateSetting(fields: UpdateProductSettingFields) {
    const currentSetting = this.settings;
    const now = new Date();
    const updatedSetting = new ProductSetting(
      fields.serviceLevel ?? currentSetting.serviceLevel,
      fields.safetyStockCalculationMethod ??
        currentSetting.safetyStockCalculationMethod,
      fields.classification ?? currentSetting.classification,
      fields.fillRate ?? currentSetting.fillRate,
      now
    );
    this.settings = updatedSetting;
    this.addTrackedEntity(this, EntityAction.updated);
  }
  archive() {
    this.deletedAt = new Date();
    this.addTrackedEntity(this, EntityAction.updated);
  }
  delete() {
    this.addTrackedEntity(this, EntityAction.deleted);
  }
}
