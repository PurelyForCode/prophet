import { DomainEvent } from "../../../core/interfaces/DomainEvent.js";
import { EntityId } from "../../../core/types/EntityId.js";
import { SaleForecastDomainEventList } from "./SaleForecastDomainEventList.js";

export class SaleForecastGeneratedDomainEvent implements DomainEvent {
  public readonly eventName: string;
  public readonly occurredOn: Date;
  public readonly payload: any;
  constructor(payload: { saleForecastId: EntityId }) {
    this.occurredOn = new Date();
    this.eventName = SaleForecastDomainEventList.SALE_FORECAST_GENERATED;
    this.payload = payload;
  }
}
