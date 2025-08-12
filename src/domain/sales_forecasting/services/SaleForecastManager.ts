import { EntityAction } from "../../../core/interfaces/AggregateRoot.js";
import { EntityId } from "../../../core/types/EntityId.js";
import { SalesForecast } from "../entities/sales_forecast/SalesForecast.js";
import { HistoricalDaysCount } from "../entities/sales_forecast/value_objects/HistoricalDaysCount.js";
import { SaleForecastGeneratedDomainEvent } from "../events/SaleForecastGenerated.js";

export class SalesForecastManager {
  deleteForecast(salesForecast: SalesForecast) {
    salesForecast.delete();
  }

  archiveForecast(salesForecast: SalesForecast) {
    salesForecast.archive();
  }

  createForecast(input: {
    id: EntityId;
    accountId: EntityId;
    productId: EntityId;
    varaintId: EntityId | null;
    forecastStartDate: Date;
    forecastEndDate: Date;
    historicalDaysCount: HistoricalDaysCount;
  }) {
    const now = new Date();
    const salesForecast = SalesForecast.create(
      input.id,
      input.accountId,
      input.productId,
      input.varaintId,
      input.historicalDaysCount,
      input.forecastStartDate,
      input.forecastEndDate,
      now,
      now,
      null
    );
    salesForecast.addTrackedEntity(salesForecast, EntityAction.created);
    return salesForecast;
  }
}
