import { IRepository } from "../../../core/interfaces/Repository.js"
import { Forecast } from "../entities/forecast/Forecast.js"

export interface IForecastRepository extends IRepository<Forecast> {}
