import { EntityId } from "../../../core/types/EntityId.js"
import { ForecastApi } from "../../../infra/services/ForecastApi.js"

export type GenerateSingleForecastInput = {
	productId: EntityId
	accountId: EntityId
	forecastStartDate: Date
	forecastEndDate: Date
	dataDepth: number
	forecastingMethod: "prophet" | "croston"
}

export class GenerateSingleForecastUsecase {
	constructor(private readonly forecastApi: ForecastApi) {}

	async call(input: GenerateSingleForecastInput) {
		const forecastId = await this.forecastApi.generateForecast({
			accountId: input.accountId,
			productId: input.productId,
			dataDepth: input.dataDepth,
			forecastingMethod: input.forecastingMethod,
			forecastEndDate: input.forecastEndDate,
			forecastStartDate: input.forecastStartDate,
		})
	}
}
