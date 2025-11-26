import { IIdGenerator } from "../../../core/interfaces/IIdGenerator.js"
import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { ForecastNotFoundException } from "../../../domain/forecasting/exceptions/ForecastNotFoundException.js"
import { ProductNeedsASupplierToGiveRecommendations } from "../../../domain/forecasting/exceptions/ProductNeedsASupplierToGiveRecommendations.js"
import { InventoryRecommendationGenerator } from "../../../domain/inventory_recommendation/services/InventoryRecommendationGenerator.js"
import { ProductNotFoundException } from "../../../domain/product_management/exceptions/ProductNotFoundException.js"

type CreateInventoryRecommendationInput = {
	forecastId: EntityId
	coverageDays: number
}

export class CreateInventoryRecommendationUsecase implements Usecase<any, any> {
	constructor(
		private readonly uow: IUnitOfWork,
		private readonly idGenerator: IIdGenerator,
	) {}

	async call(input: CreateInventoryRecommendationInput): Promise<any> {
		const forecastRepo = this.uow.getForecastRepository()
		const forecast = await forecastRepo.findById(input.forecastId)

		if (!forecast) {
			throw new ForecastNotFoundException()
		}
		const productRepo = this.uow.getProductRepository()
		const product = await productRepo.findById(forecast.productId)
		if (!product) {
			throw new ProductNotFoundException()
		}

		const deliveryRepo = this.uow.getDeliveryRepository()
		const deliveries = await deliveryRepo.findProductDeliveries(
			forecast.productId,
		)

		const supplierRepo = this.uow.getSupplierRepository()
		const defaultSupplier = await supplierRepo.findDefaultSupplier(
			forecast.productId,
		)
		if (!defaultSupplier) {
			throw new ProductNeedsASupplierToGiveRecommendations()
		}

		const analyzer = new InventoryRecommendationGenerator()
		const inventoryRecommendation = analyzer.generate(
			this.idGenerator.generate(),
			product,
			forecast,
			deliveries,
			defaultSupplier,
			14,
		)
		if (inventoryRecommendation) {
			await this.uow.save(inventoryRecommendation)
			return true
		} else {
			return false
		}
	}
}
