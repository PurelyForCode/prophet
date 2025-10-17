import {
	IsolationLevel,
	IUnitOfWork,
} from "../../../core/interfaces/IUnitOfWork.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { ProductNotFoundException } from "../../../domain/product_management/exceptions/ProductNotFoundException.js"
import { ForecastNotFoundException } from "../../../domain/forecasting/exceptions/ForecastNotFoundException.js"
import { ForecastApi } from "../../../infra/services/ForecastApi.js"
import { ForecastGeneratedDomainEvent } from "../../../domain/forecasting/events/ForecastGeneratedEvent.js"
import { IEventBus } from "../../../core/interfaces/IDomainEventBus.js"
import { ProductDoesNotHaveEnoughSalesException } from "../../../domain/forecasting/exceptions/ProductDoesNotHaveEnoughSalesException.js"
import { ProphetModelManager } from "../../../domain/forecasting/services/ProphetModelManager.js"
import { IIdGenerator } from "../../../core/interfaces/IIdGenerator.js"
import { runInTransaction } from "../../../infra/utils/UnitOfWork.js"
import { ForecastManager } from "../../../domain/forecasting/services/ForecastManager.js"
import { ProphetModel } from "../../../domain/forecasting/entities/prophet_model/ProphetModel.js"
import { DataDepth } from "../../../domain/forecasting/entities/forecast/value_objects/DataDepth.js"
import { ModelType } from "../../../domain/forecasting/entities/forecast/value_objects/ModelType.js"

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
		private readonly idGenerator: IIdGenerator,
		private readonly uow: IUnitOfWork,
		private readonly eventBus: IEventBus,
	) {}

	async call(input: GenerateSingleForecastInput) {
		const forecast = await runInTransaction(
			this.uow,
			IsolationLevel.READ_COMMITTED,
			async () => {
				const prophetModelRepo = this.uow.getProphetModelRepository()
				const productRepo = this.uow.getProductRepository()
				const product = await productRepo.findById(input.productId)
				if (!product) {
					throw new ProductNotFoundException()
				}
				if (product.saleCount.value <= 30) {
					throw new ProductDoesNotHaveEnoughSalesException()
				}
				let crostonModelId = null
				let prophetModelId = null
				if (product.settings.classification === "fast") {
					if (
						!(await prophetModelRepo.doesProductHaveModel(
							product.id,
						))
					) {
						const prophetModelManager = new ProphetModelManager()
						const prophetModel =
							prophetModelManager.createProphetModel(
								this.idGenerator.generate(),
								product.id,
							)
						prophetModelId = prophetModel.id
						await this.uow.save(prophetModel)
					} else {
						// TODO:
					}
				}

				const forecastManager = new ForecastManager()
				const forecast = forecastManager.createForecast(
					this.idGenerator.generate(),
					product.id,
					input.accountId,
					prophetModelId,
					crostonModelId,
					new DataDepth(input.dataDepth),
					input.forecastStartDate,
					input.forecastEndDate,
					new ModelType("prophet"),
					false,
				)
				await this.uow.save(forecast)
				return forecast
			},
		)

		const forecastId = await this.forecastApi.generateForecast({
			accountId: input.accountId,
			productId: input.productId,
			dataDepth: input.dataDepth,
			forecastId: forecast.id,
			forecastingMethod: forecast.modelType.value,
			forecastEndDate: input.forecastEndDate,
			forecastStartDate: input.forecastStartDate,
		})

		await runInTransaction(
			this.uow,
			IsolationLevel.READ_COMMITTED,
			async () => {
				const forecastRepo = this.uow.getForecastRepository()
				const forecast = await forecastRepo.findById(forecastId)
				if (!forecast) {
					throw new ForecastNotFoundException()
				}
				forecast.addDomainEvent(
					new ForecastGeneratedDomainEvent({
						forecastId: forecast.id,
					}),
				)
				await this.eventBus.dispatchAggregateEvents(forecast, this.uow)
			},
		)
	}
}
