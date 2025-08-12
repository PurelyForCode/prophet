import { Entity } from "../../../../core/interfaces/Entity.js";
import { EntityId } from "../../../../core/types/EntityId.js";

export class SalesForecastEntry extends Entity {
  private _sales_forecast_id: EntityId;
  public get sales_forecast_id(): EntityId {
    return this._sales_forecast_id;
  }
  public set sales_forecast_id(value: EntityId) {
    this._sales_forecast_id = value;
  }
  private _yhat: number;
  public get yhat(): number {
    return this._yhat;
  }
  public set yhat(value: number) {
    this._yhat = value;
  }
  private _yhatLower: number;
  public get yhatLower(): number {
    return this._yhatLower;
  }
  public set yhatLower(value: number) {
    this._yhatLower = value;
  }
  private _yhatUpper: number;
  public get yhatUpper(): number {
    return this._yhatUpper;
  }
  public set yhatUpper(value: number) {
    this._yhatUpper = value;
  }
  private _date: Date;
  public get date(): Date {
    return this._date;
  }
  public set date(value: Date) {
    this._date = value;
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
    (this._sales_forecast_id = salesForecastId), (this._yhat = yhat);
    this._yhatLower = yhatLower;
    this._yhatUpper = yhatUpper;
    this._date = date;
  }

  public static create(
    id: EntityId,
    salesForecastId: EntityId,
    yhat: number,
    yhatLower: number,
    yhatUpper: number,
    date: Date
  ) {
    return new SalesForecastEntry(
      id,
      salesForecastId,
      yhat,
      yhatLower,
      yhatUpper,
      date
    );
  }
}
