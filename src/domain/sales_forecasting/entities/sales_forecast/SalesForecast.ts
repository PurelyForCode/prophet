import {
  AggregateRoot,
  EntityAction,
} from "../../../../core/interfaces/AggregateRoot.js";
import { Entity } from "../../../../core/interfaces/Entity.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { HistoricalDaysCount } from "./value_objects/HistoricalDaysCount.js";

export class SalesForecast extends AggregateRoot {
  private _accountId: EntityId;
  private _productId: EntityId;
  private _variantId: EntityId | null;
  private _historicalDaysCount: HistoricalDaysCount;
  private _forecastStartDate: Date;
  private _forecastEndDate: Date;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _deletedAt: Date | null;

  archive() {
    this._deletedAt = new Date();
    this.addTrackedEntity(this, EntityAction.updated);
  }

  delete() {
    this.addTrackedEntity(this, EntityAction.deleted);
  }

  private constructor(
    id: EntityId,
    accountId: EntityId,
    productId: EntityId,
    variantId: EntityId | null,
    historicalDaysCount: HistoricalDaysCount,
    forecastStartDate: Date,
    forecastEndDate: Date,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null
  ) {
    super(id);
    this._accountId = accountId;
    this._productId = productId;
    this._variantId = variantId;
    this._historicalDaysCount = historicalDaysCount;
    this._forecastStartDate = forecastStartDate;
    this._forecastEndDate = forecastEndDate;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._deletedAt = deletedAt;
  }

  public static create(
    id: EntityId,
    accountId: EntityId,
    productId: EntityId,
    variantId: EntityId | null,
    historicalDaysCount: HistoricalDaysCount,
    forecastStartDate: Date,
    forecastEndDate: Date,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null
  ): SalesForecast {
    return new SalesForecast(
      id,
      accountId,
      productId,
      variantId ?? null,
      historicalDaysCount,
      forecastStartDate,
      forecastEndDate,
      createdAt,
      updatedAt,
      deletedAt
    );
  }

  public get accountId(): EntityId {
    return this._accountId;
  }
  public set accountId(value: EntityId) {
    this._accountId = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }
  public get productId(): EntityId {
    return this._productId;
  }
  public set productId(value: EntityId) {
    this._productId = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }

  public get variantId(): EntityId | null {
    return this._variantId;
  }
  public set variantId(value: EntityId | null) {
    this._variantId = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }

  public get historicalDaysCount(): HistoricalDaysCount {
    return this._historicalDaysCount;
  }
  public set historicalDaysCount(value: HistoricalDaysCount) {
    this._historicalDaysCount = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }

  public get forecastStartDate(): Date {
    return this._forecastStartDate;
  }
  public set forecastStartDate(value: Date) {
    this._forecastStartDate = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }

  public get forecastEndDate(): Date {
    return this._forecastEndDate;
  }
  public set forecastEndDate(value: Date) {
    this._forecastEndDate = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }

  public get createdAt(): Date {
    return this._createdAt;
  }
  public set createdAt(value: Date) {
    this._createdAt = value;
    this.addTrackedEntity(this, EntityAction.updated);
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
    this.addTrackedEntity(this, EntityAction.updated);
  }
}
