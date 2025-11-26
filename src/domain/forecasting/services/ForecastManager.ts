import { EntityAction } from "../../../core/interfaces/AggregateRoot.js"
import { Entity } from "../../../core/interfaces/Entity.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { Forecast } from "../entities/forecast/Forecast.js"
import { DataDepth } from "../entities/forecast/value_objects/DataDepth.js"
import { ModelType } from "../entities/forecast/value_objects/ModelType.js"

export class ForecastManager {
	createForecast(
		id: EntityId,
		productId: EntityId,
		accountId: EntityId,
		prophetModelId: EntityId | null,
		crostonModelId: EntityId | null,
		dataDepth: DataDepth,
		forecastStartDate: Date,
		forecastEndDate: Date,
		modelType: ModelType,
		processed: boolean,
	) {
		const now = new Date()
		const forecast = Forecast.create({
			id,
			productId,
			accountId,
			prophetModelId,
			crostonModelId,
			dataDepth,
			forecastEndDate,
			forecastStartDate,
			modelType,
			processed,
			createdAt: now,
			updatedAt: now,
			deletedAt: null,
			entries: new Map(),
		})
		forecast.addTrackedEntity(forecast, EntityAction.created)
		return forecast
	}
}
