import { Repository } from "../../../core/interfaces/Repository.js";
import { SalesForecast } from "../entities/sales_forecast/SalesForecast.js";

export interface ISalesForecastRepository extends Repository<SalesForecast> {}
