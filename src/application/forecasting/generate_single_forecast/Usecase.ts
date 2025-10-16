import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { ProductNotFoundException } from "../../../domain/product_management/exceptions/ProductNotFoundException.js"
import { ForecastNotFoundException } from "../../../domain/forecasting/exceptions/ForecastNotFoundException.js"
import { ForecastApi } from "../../../infra/services/ForecastApi.js"
import { ForecastGeneratedDomainEvent } from "../../../domain/forecasting/events/ForecastGeneratedEvent.js"
import { IEventBus } from "../../../core/interfaces/IDomainEventBus.js"

export type GenerateSingleForecastInput = {
	productId: EntityId
	accountId: EntityId
	forecastStartDate: Date
	forecastEndDate: Date
	dataDepth: number
}

export class GenerateSingleForecastUsecase {
	constructor(
		private readonly forecastApi: ForecastApi,
		private readonly uow: IUnitOfWork,
		private readonly eventBus: IEventBus,
	) {}

	async call(input: GenerateSingleForecastInput) {
		const forecastRepo = this.uow.getForecastRepository()
		const productRepo = this.uow.getProductRepository()

		const product = await productRepo.findById(input.productId)
		if (!product) {
			throw new ProductNotFoundException()
		}

		const forecastingMethod =
			product.settings.classification === "fast" ? "prophet" : "croston"

		const forecastId = await this.forecastApi.generateForecast({
			accountId: input.accountId,
			productId: input.productId,
			dataDepth: input.dataDepth,
			forecastingMethod: forecastingMethod,
			forecastEndDate: input.forecastEndDate,
			forecastStartDate: input.forecastStartDate,
		})

		const forecast = await forecastRepo.findById(forecastId)
		if (!forecast) {
			throw new ForecastNotFoundException()
		}
		forecast.addDomainEvent(
			new ForecastGeneratedDomainEvent({ forecastId: forecast.id }),
		)
		await this.eventBus.dispatchAggregateEvents(forecast, this.uow)
	}
}
