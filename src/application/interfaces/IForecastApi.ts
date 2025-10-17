import { EntityId } from "../../core/types/EntityId.js"

export type GenerateForecastInput = {
	accountId: EntityId
	forecastId: EntityId
	productId: EntityId
	dataDepth: number
	forecastStartDate: Date
	forecastEndDate: Date
	forecastingMethod: "prophet" | "croston"
}

export type GenerateAllForecastInput = {
	accountId: EntityId
	forecastStartDate: Date
	forecastEndDate: Date
	dataStartDate: Date
	dataEndDate: Date
}

export interface IForecastApi {
	generateForecast(params: GenerateForecastInput): Promise<EntityId>
	generateAllForecasts(params: GenerateAllForecastInput): Promise<void>
}
