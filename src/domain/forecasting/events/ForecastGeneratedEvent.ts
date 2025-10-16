import { DomainEvent } from "../../../core/interfaces/DomainEvent.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { ForecastDomainEventList } from "./ForecastDomainEventList.js"

type ForecastGeneratedDomainEventPayload = {
	forecastId: EntityId
}

export class ForecastGeneratedDomainEvent
	implements DomainEvent<ForecastGeneratedDomainEventPayload>
{
	public readonly eventName: string
	public readonly occurredOn: Date
	public readonly payload: ForecastGeneratedDomainEventPayload
	constructor(payload: ForecastGeneratedDomainEventPayload) {
		this.occurredOn = new Date()
		this.eventName = ForecastDomainEventList.FORECAST_GENERATED
		this.payload = payload
	}
}
