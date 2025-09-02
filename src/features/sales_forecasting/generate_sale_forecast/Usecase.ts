import { IEventBus } from "../../../core/interfaces/IDomainEventBus.js";
import { IIdGenerator } from "../../../core/interfaces/IIdGenerator.js";
import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js";
import { EntityId } from "../../../core/types/EntityId.js";
import { ProductNotFoundException } from "../../../domain/product_management/exceptions/ProductNotFoundException.js";
import { HistoricalDaysCount } from "../../../domain/sales_forecasting/entities/sales_forecast/value_objects/HistoricalDaysCount.js";
import { SalesForecastManager } from "../../../domain/sales_forecasting/services/SaleForecastManager.js";

export type GenerateSaleForecastInput = {
  productId: EntityId;
  accountId: EntityId;
  forecastStartDate: Date;
  forecastEndDate: Date;
  historicalDaysCount: number;
};

export class GenerateSaleForecastUsecase {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly eventBus: IEventBus,
    private readonly idGenerator: IIdGenerator
  ) {}

  async call(input: GenerateSaleForecastInput) {
    const productRepo = this.uow.getProductRepository();
    let product = await productRepo.findById(input.productId);
    if (!product) {
      throw new ProductNotFoundException();
    }
    const forecastManager = new SalesForecastManager();
    const id = this.idGenerator.generate();
    const forecast = forecastManager.createForecast({
      id: id,
      accountId: input.accountId,
      forecastEndDate: input.forecastEndDate,
      forecastStartDate: input.forecastStartDate,
      historicalDaysCount: new HistoricalDaysCount(input.historicalDaysCount),
      productId: input.productId,
    });

    await this.uow.save(forecast);
    await this.eventBus.dispatch(forecast, this.uow);
  }
}
