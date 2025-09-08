import { IEventBus } from "../../../core/interfaces/IDomainEventBus.js";
import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js";
import { EntityId } from "../../../core/types/EntityId.js";
import { SingleForecastGeneratedDomainEvent } from "../../../domain/sales_forecasting/events/SingleForecastGenerated.js";
import { ForecastApi } from "../../../infra/services/ForecastAPI.js";

export type GenerateSingleForecastInput = {
  productId: EntityId;
  accountId: EntityId;
  forecastStartDate: Date;
  forecastEndDate: Date;
  dataStartDate: Date;
  dataEndDate: Date;
};

export class GenerateSingleForecastUsecase {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly eventBus: IEventBus,
    private readonly forecastApi: ForecastApi
  ) {}

  async call(input: GenerateSingleForecastInput) {
    await this.forecastApi.generateForecast({
      accountId: input.accountId,
      productId: input.productId,
      dataEndDate: input.dataEndDate,
      dataStartDate: input.dataStartDate,
      forecastEndDate: input.forecastEndDate,
      forecastStartDate: input.forecastStartDate,
    });
    await this.eventBus.handleEvent(
      new SingleForecastGeneratedDomainEvent({ productId: input.productId }),
      this.uow
    );
  }
}
