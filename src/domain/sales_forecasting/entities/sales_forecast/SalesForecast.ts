import {
  AggregateRoot,
  EntityAction,
} from "../../../../core/interfaces/AggregateRoot.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { HistoricalDaysCount } from "./value_objects/HistoricalDaysCount.js";

export class SalesForecast extends AggregateRoot {
  private accountId: EntityId;
  private productId: EntityId;
  private historicalDaysCount: HistoricalDaysCount;
  private forecastStartDate: Date;
  private forecastEndDate: Date;
  private createdAt: Date;
  private updatedAt: Date;
  private deletedAt: Date | null;

  archive() {
    this.deletedAt = new Date();
    this.addTrackedEntity(this, EntityAction.updated);
  }

  delete() {
    this.addTrackedEntity(this, EntityAction.deleted);
  }

  private constructor(
    id: EntityId,
    accountId: EntityId,
    productId: EntityId,
    historicalDaysCount: HistoricalDaysCount,
    forecastStartDate: Date,
    forecastEndDate: Date,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null
  ) {
    super(id);
    this.accountId = accountId;
    this.productId = productId;
    this.historicalDaysCount = historicalDaysCount;
    this.forecastStartDate = forecastStartDate;
    this.forecastEndDate = forecastEndDate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  public static create(params: {
    id: EntityId;
    accountId: EntityId;
    productId: EntityId;
    historicalDaysCount: HistoricalDaysCount;
    forecastStartDate: Date;
    forecastEndDate: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): SalesForecast {
    return new SalesForecast(
      params.id,
      params.accountId,
      params.productId,
      params.historicalDaysCount,
      params.forecastStartDate,
      params.forecastEndDate,
      params.createdAt,
      params.updatedAt,
      params.deletedAt
    );
  }

  public getAccountId(): EntityId {
    return this.accountId;
  }
  public setAccountId(value: EntityId) {
    this.accountId = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }
  public getProductId(): EntityId {
    return this.productId;
  }
  public setProductId(value: EntityId) {
    this.productId = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }

  public getHistoricalDaysCount(): HistoricalDaysCount {
    return this.historicalDaysCount;
  }
  public setHistoricalDaysCount(value: HistoricalDaysCount) {
    this.historicalDaysCount = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }

  public getForecastStartDate(): Date {
    return this.forecastStartDate;
  }
  public setForecastStartDate(value: Date) {
    this.forecastStartDate = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }

  public getForecastEndDate(): Date {
    return this.forecastEndDate;
  }
  public setForecastEndDate(value: Date) {
    this.forecastEndDate = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }
  public setCreatedAt(value: Date) {
    this.createdAt = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
  public setUpdatedAt(value: Date) {
    this.updatedAt = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }

  public getDeletedAt(): Date | null {
    return this.deletedAt;
  }
  public setDeletedAt(value: Date | null) {
    this.deletedAt = value;
    this.addTrackedEntity(this, EntityAction.updated);
  }
}
