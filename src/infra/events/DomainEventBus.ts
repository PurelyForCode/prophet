import { DomainEvent } from "../../core/interfaces/DomainEvent.js"
import {
	DomainEventHandler,
	IEventBus,
} from "../../core/interfaces/IDomainEventBus.js"
import { AggregateRoot } from "../../core/interfaces/AggregateRoot.js"
import { UnitOfWork } from "../utils/UnitOfWork.js"
import { IncrementProductSalesCountEventHandler } from "./handlers/sales/sale_created/IncrementProductSalesCountEventHandler.js"

export class EventBus implements IEventBus {
	private handlers: Map<string, DomainEventHandler<any>[]> = new Map()

	constructor() {
		this.register(new IncrementProductSalesCountEventHandler())
	}

	register<T>(handler: DomainEventHandler<any>) {
		const handlers = this.handlers.get(handler.eventName) || []
		handlers.push(handler)
		this.handlers.set(handler.eventName, handlers)
	}

	async handleEvent(event: DomainEvent<any>, uow: UnitOfWork) {
		console.log("handling: " + event.eventName)
		const handlers = this.handlers.get(event.eventName)
		if (!handlers) return
		for (const handler of handlers) {
			await handler.handle(event, uow) // Let handler optionally use UoW
		}
	}

	async dispatchAggregateEvents(
		aggregateRoot: AggregateRoot,
		uow: UnitOfWork,
	) {
		const events = aggregateRoot.getDomainEvent()
		for (const event of events) {
			await this.handleEvent(event, uow)
		}
		aggregateRoot.clearDomainEvent()
	}
}
