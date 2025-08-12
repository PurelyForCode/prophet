import { EntityId } from "../../core/types/EntityId.js";

export interface ForecastingService {
  generateForecast(input: { forecastId: EntityId }): Promise<void>;
}

export class PythonForecastingService {
  constructor() {}
  async generateForecast(input: { forecastId: EntityId }) {}
}
