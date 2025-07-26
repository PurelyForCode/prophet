import { InvalidEntityCreated } from "../../../../core/exceptions/InvalidEntityCreated.js";
import { ValueException } from "../../../../core/exceptions/ValueException.js";
import {
  AggregateRoot,
  EntityAction,
} from "../../../../core/interfaces/AggregateRoot.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { SaleQuantity } from "./value_objects/SaleQuantity.js";
import { SaleStatus } from "./value_objects/SaleStatus.js";

export type SaleUpdateableFields = Partial<{
  quantity: SaleQuantity;
  status: SaleStatus;
  date: Date;
}>;

export class Sale extends AggregateRoot {
  private _accountId: EntityId;
  private _productId: EntityId;
  private _variantId: EntityId | null;
  private _quantity: SaleQuantity;
  private _status: SaleStatus;
  private _date: Date;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _deletedAt: Date | null;

  public get accountId(): EntityId {
    return this._accountId;
  }
  public set accountId(value: EntityId) {
    this._accountId = value;
  }

  public get productId(): EntityId {
    return this._productId;
  }
  public set productId(value: EntityId) {
    this._productId = value;
  }
  public get variantId(): EntityId | null {
    return this._variantId;
  }
  public set variantId(value: EntityId | null) {
    this._variantId = value;
  }
  public get quantity(): SaleQuantity {
    return this._quantity;
  }
  public set quantity(value: SaleQuantity) {
    this._quantity = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }
  public get status(): SaleStatus {
    return this._status;
  }
  public set status(value: SaleStatus) {
    this._status = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }
  public get date(): Date {
    return this._date;
  }
  public set date(value: Date) {
    this._date = value;
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
    this.addTrackedEntity(this, EntityAction.updated);
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
    productId: EntityId,
    variantId: EntityId | null,
    quantity: SaleQuantity,
    status: SaleStatus,
    date: Date,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null
  ) {
    super(id);
    this._accountId = accountId;
    this._productId = productId;
    this._variantId = variantId;
    this._quantity = quantity;
    this._status = status;
    this._date = date;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._deletedAt = deletedAt;
  }

  static create(
    id: EntityId,
    accountId: EntityId,
    productId: EntityId,
    variantId: EntityId | null,
    quantity: SaleQuantity,
    status: SaleStatus,
    date: Date,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null
  ): Sale {
    try {
      const sale = new Sale(
        id,
        accountId,
        productId,
        variantId,
        quantity,
        status,
        date,
        createdAt,
        updatedAt,
        deletedAt
      );
      return sale;
    } catch (error) {
      throw new InvalidEntityCreated(error as ValueException);
    }
  }
  archive() {
    this.deletedAt = new Date();
    this.addTrackedEntity(this, EntityAction.updated);
  }

  delete() {
    this.addTrackedEntity(this, EntityAction.deleted);
  }
}
