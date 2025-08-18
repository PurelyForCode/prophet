import { Entity } from "../../../../core/interfaces/Entity.js";
import { EntityId } from "../../../../core/types/EntityId.js";

export class SalesForecastEntry extends Entity {
  private salesForecastId: EntityId;
  getSalesForecastId(): EntityId {
    return this.salesForecastId;
  }
  setSalesForecastId(value: EntityId) {
    this.salesForecastId = value;
  }
  private yhat: number;
  getYhat(): number {
    return this.yhat;
  }
  setYhat(value: number) {
    this.yhat = value;
  }
  private yhatLower: number;
  getYhatLower(): number {
    return this.yhatLower;
  }
  setYhatLower(value: number) {
    this.yhatLower = value;
  }
  yhatUpper: number;
  getYhatUpper(): number {
    return this.yhatUpper;
  }
  setYhatUpper(value: number) {
    this.yhatUpper = value;
  }
  private date: Date;
  getDate(): Date {
    return this.date;
  }
  setDate(value: Date) {
    this.date = value;
  }

  private constructor(
    id: EntityId,
    salesForecastId: EntityId,
    yhat: number,
    yhatLower: number,
    yhatUpper: number,
    date: Date
  ) {
    super(id);
    this.salesForecastId = salesForecastId;
    this.yhat = yhat;
    this.yhatLower = yhatLower;
    this.yhatUpper = yhatUpper;
    this.date = date;
  }

  public static create(params: {
    id: EntityId;
    salesForecastId: EntityId;
    yhat: number;
    yhatLower: number;
    yhatUpper: number;
    date: Date;
  }) {
    return new SalesForecastEntry(
      params.id,
      params.salesForecastId,
      params.yhat,
      params.yhatLower,
      params.yhatUpper,
      params.date
    );
  }
}
