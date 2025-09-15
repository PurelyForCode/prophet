import { EntityId } from "../../core/types/EntityId.js";

export type GenerateForecastInput = {
  productId: EntityId;
  accountId: EntityId;
  forecastStartDate: Date;
  forecastEndDate: Date;
  dataStartDate: Date;
  dataEndDate: Date;
};

export type GenerateAllForecastInput = {
  accountId: EntityId;
  forecastStartDate: Date;
  forecastEndDate: Date;
  dataStartDate: Date;
  dataEndDate: Date;
};

export interface IForecastApi {
  generateForecast(params: GenerateForecastInput): Promise<EntityId>;
  generateAllForecasts(params: GenerateAllForecastInput): Promise<void>;
}
