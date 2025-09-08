import { EntityAction } from "../../../core/interfaces/AggregateRoot.js";
import { EntityId } from "../../../core/types/EntityId.js";
import { SalesForecast } from "../entities/forecast/Forecast.js";
import { HistoricalDaysCount } from "../entities/forecast/value_objects/HistoricalDaysCount.js";
import { SingleForecastGeneratedDomainEvent } from "../events/SingleForecastGenerated.js";

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
    forecastStartDate: Date;
    forecastEndDate: Date;
    historicalDaysCount: HistoricalDaysCount;
  }) {
    const now = new Date();
    const salesForecast = SalesForecast.create({
      id: input.id,
      accountId: input.accountId,
      productId: input.productId,
      historicalDaysCount: input.historicalDaysCount,
      forecastStartDate: input.forecastStartDate,
      forecastEndDate: input.forecastEndDate,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
    salesForecast.addTrackedEntity(salesForecast, EntityAction.created);
    salesForecast.addDomainEvent(
      new SingleForecastGeneratedDomainEvent({
        forecastId: salesForecast.id,
      })
    );
    return salesForecast;
  }
}
