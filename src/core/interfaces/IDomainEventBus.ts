import { AggregateRoot } from "./AggregateRoot.js";
import { DomainEvent } from "./DomainEvent.js";
import { IUnitOfWork } from "./IUnitOfWork.js";

export interface DomainEventHandler<T extends DomainEvent = DomainEvent> {
  eventName: string;
  handle(event: T, uow: IUnitOfWork): Promise<void>;
}

export interface IEventBus {
  dispatch(aggregateRoot: AggregateRoot, uow: IUnitOfWork): Promise<void>;
}
