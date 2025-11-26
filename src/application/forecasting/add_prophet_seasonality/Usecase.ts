import { IIdGenerator } from "../../../core/interfaces/IIdGenerator.js"
import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { StandardName } from "../../../core/value_objects/StandardName.js"
import { ProphetSeasonality } from "../../../domain/forecasting/entities/prophet_model_seasonality/ProphetSeasonality.js"
import { FourierOrder } from "../../../domain/forecasting/entities/prophet_model_seasonality/value_object/FourierOrder.js"
import { PriorScale } from "../../../domain/forecasting/entities/prophet_model_seasonality/value_object/PriorScale.js"
import { SeasonalPeriodDays } from "../../../domain/forecasting/entities/prophet_model_seasonality/value_object/SeasonalPeriodDays.js"
import { ForecastingEffect } from "../../../domain/forecasting/entities/prophet_model_setting/value_objects/ForecastingEffect.js"
import { ProphetModelNotFoundException } from "../../../domain/forecasting/exceptions/ProphetModelNotFoundException.js"
import { ProductGroupNotFoundException } from "../../../domain/product_management/exceptions/ProductGroupNotFoundException.js"
import { ProductNotFoundException } from "../../../domain/product_management/exceptions/ProductNotFoundException.js"

type AddProphetSeasonalityInput = {
	groupId: string
	productId: string
	prophetModelId: string
	season: {
		periodDays: number
		priorScale: number
		name: string
		fourierOrder: number
		mode: string
	}
}

export class AddProphetSeasonalityUsecase
	implements Usecase<AddProphetSeasonalityInput, any>
{
	constructor(
		private uow: IUnitOfWork,
		private idGenerator: IIdGenerator,
	) {}
	async call(input: AddProphetSeasonalityInput) {
		const prophetModelRepo = this.uow.getProphetModelRepository()
		const groupRepo = this.uow.getProductGroupRepository()
		const group = await groupRepo.findById(input.groupId)
		if (!group) {
			throw new ProductGroupNotFoundException()
		}
		const product = group.getVariant(input.productId)
		if (!product) {
			throw new ProductNotFoundException()
		}
		const prophetModel = await prophetModelRepo.findById(
			input.prophetModelId,
		)
		if (!prophetModel || prophetModel.productId !== input.productId) {
			throw new ProphetModelNotFoundException()
		}
		const seasonality = ProphetSeasonality.create({
			id: this.idGenerator.generate(),
			modelSettingId: prophetModel.id,
			fourierOrder: new FourierOrder(input.season.fourierOrder),
			periodDays: new SeasonalPeriodDays(input.season.periodDays),
			mode: new ForecastingEffect(input.season.mode),
			priorScale: new PriorScale(input.season.priorScale),
			name: new StandardName(input.season.name, "seasonality name"),
		})
		prophetModel.addSeasonality(seasonality)
		await this.uow.save(prophetModel)
	}
}
