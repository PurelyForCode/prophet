import { DomainEventHandler } from "../../../../core/interfaces/IDomainEventBus.js"
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js"
import { ForecastDomainEventList } from "../../../../domain/forecasting/events/ForecastDomainEventList.js"
import { ForecastGeneratedDomainEvent } from "../../../../domain/forecasting/events/ForecastGeneratedEvent.js"
import { ForecastNotFoundException } from "../../../../domain/forecasting/exceptions/ForecastNotFoundException.js"
import { ProductNeedsASupplierToGiveRecommendations } from "../../../../domain/forecasting/exceptions/ProductNeedsASupplierToGiveRecommendations.js"
import { InventoryRecommendationGenerator } from "../../../../domain/inventory_recommendation/services/ForecastAnalyzer.js"
import { ProductNotFoundException } from "../../../../domain/product_management/exceptions/ProductNotFoundException.js"
import { idGenerator } from "../../../../infra/utils/IdGenerator.js"

export class GenerateInventoryRecommendationDomainHandler
	implements DomainEventHandler
{
	eventName: string = ForecastDomainEventList.FORECAST_GENERATED

	async handle(
		event: ForecastGeneratedDomainEvent,
		uow: IUnitOfWork,
	): Promise<void> {
		const forecastId = event.payload.forecastId
		const forecastRepo = uow.getForecastRepository()
		const forecast = await forecastRepo.findById(forecastId)

		if (!forecast) {
			throw new ForecastNotFoundException()
		}
		const productRepo = uow.getProductRepository()
		const product = await productRepo.findById(forecast.productId)
		if (!product) {
			throw new ProductNotFoundException()
		}

		const deliveryRepo = uow.getDeliveryRepository()
		const deliveries = await deliveryRepo.findProductDeliveries(
			forecast.productId,
		)

		const supplierRepo = uow.getSupplierRepository()
		const defaultSupplier = await supplierRepo.findDefaultSupplier(
			forecast.productId,
		)
		if (!defaultSupplier) {
			throw new ProductNeedsASupplierToGiveRecommendations()
		}

		const inventoryRecommendationGenerator =
			new InventoryRecommendationGenerator()
		const inventoryRecommendation =
			inventoryRecommendationGenerator.generate(
				idGenerator.generate(),
				product,
				forecast,
				deliveries,
				defaultSupplier,
				{
					restockStrategy: "safe",
				},
			)
		if (inventoryRecommendation) {
			console.log("generated")
			await uow.save(inventoryRecommendation)
		}
	}
}
