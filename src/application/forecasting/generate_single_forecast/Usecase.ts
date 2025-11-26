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
import { DataDepth } from "../../../domain/forecasting/entities/forecast/value_objects/DataDepth.js"
import { ModelType } from "../../../domain/forecasting/entities/forecast/value_objects/ModelType.js"
import { ProductGroupNotFoundException } from "../../../domain/product_management/exceptions/ProductGroupNotFoundException.js"

export type GenerateSingleForecastInput = {
	groupId: EntityId
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
				const groupRepo = this.uow.getProductGroupRepository()
				const group = await groupRepo.findById(input.groupId)
				if (!group) {
					throw new ProductGroupNotFoundException()
				}
				const product = group.getVariant(input.productId)
				if (!product) {
					throw new ProductNotFoundException()
				}
				// check if product has enough sales
				if (product.saleCount.value <= 30) {
					throw new ProductDoesNotHaveEnoughSalesException()
				}
				let crostonModelId = null
				let prophetModelId = null

				const prophetModelRepo = this.uow.getProphetModelRepository()
				const hasModel =
					await prophetModelRepo.doesProductHaveActiveModel(
						product.id,
					)

				if (product.settings.classification === "fast" && !hasModel) {
					const prophetModelManager = new ProphetModelManager()
					const prophetModel = prophetModelManager.createProphetModel(
						this.idGenerator.generate(),
						product.id,
						true,
						"default",
					)
					prophetModelId = prophetModel.id
					await this.uow.save(prophetModel)
				} else if (
					product.settings.classification === "slow" &&
					hasModel
				) {
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
		const supplierRepo = this.uow.getSupplierRepository()
		const hasDefaultSupplier = await supplierRepo.findDefaultSupplier(
			forecast.productId,
		)

		if (hasDefaultSupplier) {
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
					await this.eventBus.dispatchAggregateEvents(
						forecast,
						this.uow,
					)
				},
			)
		}
	}
}
