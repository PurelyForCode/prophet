import { EntityAction } from "../../../core/interfaces/AggregateRoot.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { Forecast } from "../entities/forecast/Forecast.js"
import { DataDepth } from "../entities/forecast/value_objects/HistoricalDaysCount.js"
import { SingleForecastGeneratedDomainEvent } from "../events/SingleForecastGenerated.js"

export class SalesForecastManager {
	deleteForecast(salesForecast: Forecast) {
		salesForecast.delete()
	}

	archiveForecast(salesForecast: Forecast) {
		salesForecast.archive()
	}

	createForecast(input: {
		id: EntityId
		accountId: EntityId
		productId: EntityId
		forecastStartDate: Date
		forecastEndDate: Date
		historicalDaysCount: DataDepth
	}) {
		const now = new Date()
		const salesForecast = Forecast.create({
			id: input.id,
			accountId: input.accountId,
			productId: input.productId,
			dataDepth: input.historicalDaysCount,
			forecastStartDate: input.forecastStartDate,
			forecastEndDate: input.forecastEndDate,
			createdAt: now,
			updatedAt: now,
			deletedAt: null,
		})
		salesForecast.addTrackedEntity(salesForecast, EntityAction.created)
		salesForecast.addDomainEvent(
			new SingleForecastGeneratedDomainEvent({
				forecastId: salesForecast.id,
			}),
		)
		return salesForecast
	}
}
