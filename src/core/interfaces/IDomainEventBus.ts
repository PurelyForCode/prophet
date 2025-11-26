import { AggregateRoot } from "./AggregateRoot.js"
import { DomainEvent } from "./DomainEvent.js"
import { IUnitOfWork } from "./IUnitOfWork.js"

export interface DomainEventHandler<
	E extends DomainEvent<any> = DomainEvent<any>,
> {
	eventName: E["eventName"]

	handle(event: E, uow: IUnitOfWork): Promise<void>
}

export interface IEventBus {
	dispatchAggregateEvents(
		aggregateRoot: AggregateRoot,
		uow: IUnitOfWork,
	): Promise<void>

	handleEvent<E extends DomainEvent<any>>(
		event: E,
		uow: IUnitOfWork,
	): Promise<void>
}
