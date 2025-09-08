import { IRepository } from "../../../core/interfaces/Repository.js";
import { SalesForecastEntry } from "../entities/forecast_entry/ForecastEntry.js";

export interface IForecastEntryRepository
  extends IRepository<SalesForecastEntry> {}
