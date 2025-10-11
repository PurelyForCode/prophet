import { EntityId } from "../../../core/types/EntityId.js"
import { ForecastApi } from "../../../infra/services/ForecastApi.js"

export type GenerateAllForecastInput = {
	accountId: EntityId
	forecastStartDate: Date
	forecastEndDate: Date
	dataStartDate: Date
	dataEndDate: Date
}

export class GenerateAllForecastUsecase {
	constructor(private readonly forecastApi: ForecastApi) {}

	async call(input: GenerateAllForecastInput) {
		await this.forecastApi.generateAllForecast({
			accountId: input.accountId,
			dataEndDate: input.dataEndDate,
			dataStartDate: input.dataStartDate,
			forecastEndDate: input.forecastEndDate,
			forecastStartDate: input.forecastStartDate,
		})
	}
}
