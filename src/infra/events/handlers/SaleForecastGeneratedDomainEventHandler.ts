import { DomainEventHandler } from "../../../core/interfaces/IDomainEventBus.js";
import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js";
import { SaleForecastGeneratedDomainEvent } from "../../../domain/sales_forecasting/events/SaleForecastGenerated.js";

export class SaleForecastGeneratedDomainEventHandler
  implements DomainEventHandler
{
  eventName: string = "FORECAST_CREATED";

  constructor() {}

  handle(
    event: SaleForecastGeneratedDomainEvent,
    uow: IUnitOfWork
  ): Promise<void> {
    const payload = event.payload;
  }
}
