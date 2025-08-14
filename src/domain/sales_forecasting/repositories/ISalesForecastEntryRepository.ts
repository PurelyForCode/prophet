import { IRepository } from "../../../core/interfaces/Repository.js";
import { SalesForecastEntry } from "../entities/sales_forecast_entry/SalesForecastEntry.js";

export interface ISalesForecastEntryRepository
  extends IRepository<SalesForecastEntry> {}
