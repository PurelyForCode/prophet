import { DomainEventHandler } from "../../../core/interfaces/IDomainEventBus.js";
import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js";
import { SingleForecastGeneratedDomainEvent } from "../../../domain/sales_forecasting/events/SingleForecastGenerated.js";
import { forecastApi, ForecastApi } from "../../services/ForecastAPI.js";

export class SingleForecastGeneratedDomainEventHandler
  implements DomainEventHandler
{
  constructor(private readonly forecastApi: ForecastApi) {}
  eventName: string = "FORECAST_CREATED";

  async handle(
    event: SingleForecastGeneratedDomainEvent,
    uow: IUnitOfWork
  ): Promise<void> {
    const payload = event.payload;
    await this.forecastApi.generateForecast({
      forecastEndDate: payload.forecastEndDate,
      forecastStartDate: payload.forecastStartDate,
      historicalDaysCount: payload.historicalDaysCount,
      forecastId: payload.forecastId,
    });
  }
}

export const singleForecastGeneratedDomainEventHandler =
  new SingleForecastGeneratedDomainEventHandler(forecastApi);
