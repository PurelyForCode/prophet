import {
  AggregateRoot,
  EntityAction,
} from "../../../../core/interfaces/AggregateRoot.js";
import { EntityCollection } from "../../../../core/types/EntityCollection.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { SuppliedProduct } from "../supplied_product/SuppliedProduct.js";
import { LeadTime } from "./value_objects/LeadTime.js";
import { SupplierName } from "./value_objects/SupplierName.js";

export type UpdateSupplierFields = Partial<{
  name: SupplierName;
  leadTime: LeadTime;
}>;

export class Supplier extends AggregateRoot {
  private constructor(
    id: EntityId,
    private _accountId: EntityId,
    private _name: SupplierName,
    private _leadTime: LeadTime,
    private _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | null,
    private _productsSupplied: EntityCollection<SuppliedProduct>
  ) {
    super(id);
  }

  static create(
    id: EntityId,
    accountId: EntityId,
    name: SupplierName,
    leadTime: LeadTime,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null,
    productsSupplied: EntityCollection<SuppliedProduct>
  ) {
    return new Supplier(
      id,
      accountId,
      name,
      leadTime,
      createdAt,
      updatedAt,
      deletedAt,
      productsSupplied
    );
  }

  addSuppliedProduct(product: SuppliedProduct) {}
  removeSuppliedProduct(productId: SuppliedProduct) {}
  updateSuppliedProduct(productId: SuppliedProduct) {}
  archive() {
    this._deletedAt = new Date();
    this.addTrackedEntity(this, EntityAction.deleted);
  }

  public get productsSupplied(): EntityCollection<SuppliedProduct> {
    return this._productsSupplied;
  }
  public set productsSupplied(value: EntityCollection<SuppliedProduct>) {
    this._productsSupplied = value;
  }
  public get deletedAt(): Date | null {
    return this._deletedAt;
  }
  public set deletedAt(value: Date | null) {
    this._deletedAt = value;
  }
  public get updatedAt(): Date {
    return this._updatedAt;
  }
  public set updatedAt(value: Date) {
    this._updatedAt = value;
  }
  public get createdAt(): Date {
    return this._createdAt;
  }
  public set createdAt(value: Date) {
    this._createdAt = value;
  }
  public get leadTime(): LeadTime {
    return this._leadTime;
  }
  public set leadTime(value: LeadTime) {
    this._leadTime = value;
  }
  public get name(): SupplierName {
    return this._name;
  }
  public set name(value: SupplierName) {
    this._name = value;
  }
  public get accountId(): EntityId {
    return this._accountId;
  }
  public set accountId(value: EntityId) {
    this._accountId = value;
  }
}
