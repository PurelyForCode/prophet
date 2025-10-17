import { IRepository } from "../../../core/interfaces/Repository.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { Forecast } from "../entities/forecast/Forecast.js"

export interface IForecastRepository extends IRepository<Forecast> {
	findById(id: EntityId): Promise<Forecast | null>
}
