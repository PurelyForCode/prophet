import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { StandardName } from "../../../core/value_objects/StandardName.js"
import { FourierOrder } from "../../../domain/forecasting/entities/prophet_model_seasonality/value_object/FourierOrder.js"
import { PriorScale } from "../../../domain/forecasting/entities/prophet_model_seasonality/value_object/PriorScale.js"
import { SeasonalPeriodDays } from "../../../domain/forecasting/entities/prophet_model_seasonality/value_object/SeasonalPeriodDays.js"
import { ForecastingEffect } from "../../../domain/forecasting/entities/prophet_model_setting/value_objects/ForecastingEffect.js"
import { ProphetModelNotFoundException } from "../../../domain/forecasting/exceptions/ProphetModelNotFoundException.js"

type UpdateProphetSeasonalityInput = {
	productId: string
	prophetModelId: string
	seasonalityId: string
	fields: Partial<{
		name: string
		periodDays: number
		fourierOrder: number
		priorScale: number
		mode: string
	}>
}

export class UpdateProphetSeasonalityUsecase
	implements Usecase<UpdateProphetSeasonalityInput, any>
{
	constructor(private uow: IUnitOfWork) {}
	async call(input: UpdateProphetSeasonalityInput) {
		const prophetModelRepo = this.uow.getProphetModelRepository()
		const prophetModel = await prophetModelRepo.findById(
			input.prophetModelId,
		)
		if (!prophetModel || prophetModel.productId !== input.productId) {
			throw new ProphetModelNotFoundException()
		}
		prophetModel.updateSeasonality(input.seasonalityId, {
			fourierOrder: input.fields.fourierOrder
				? new FourierOrder(input.fields.fourierOrder)
				: undefined,
			mode: input.fields.mode
				? new ForecastingEffect(input.fields.mode)
				: undefined,

			name: input.fields.name
				? new StandardName(input.fields.name, "seasonality name")
				: undefined,
			periodDays: input.fields.periodDays
				? new SeasonalPeriodDays(input.fields.periodDays)
				: undefined,
			priorScale: input.fields.priorScale
				? new PriorScale(input.fields.priorScale)
				: undefined,
		})
		await this.uow.save(prophetModel)
	}
}
