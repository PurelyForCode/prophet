import { IRepository } from "../../../core/interfaces/Repository.js";
import { SalesForecast } from "../entities/forecast/Forecast.js";

export interface IForecastRepository extends IRepository<SalesForecast> {}
