import { IRepository } from "../../../core/interfaces/Repository.js"
import { ForecastEntry } from "../entities/forecast_entry/ForecastEntry.js"

export interface IForecastEntryRepository extends IRepository<ForecastEntry> {}
