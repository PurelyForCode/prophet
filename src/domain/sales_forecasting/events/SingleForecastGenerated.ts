import { DomainEvent } from "../../../core/interfaces/DomainEvent.js";
import { EntityId } from "../../../core/types/EntityId.js";
import { ForecastDomainEventList } from "./SaleForecastDomainEventList.js";

type ForecastGeneratedDomainEventPayload = {
  productId: EntityId;
};

export class SingleForecastGeneratedDomainEvent implements DomainEvent {
  public readonly eventName: string;
  public readonly occurredOn: Date;
  public readonly payload: ForecastGeneratedDomainEventPayload;
  constructor(payload: ForecastGeneratedDomainEventPayload) {
    this.occurredOn = new Date();
    this.eventName = ForecastDomainEventList.SINGLE_FORECAST_GENERATED;
    this.payload = payload;
  }
}
