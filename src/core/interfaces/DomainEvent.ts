export abstract class DomainEvent<T> {
	readonly occurredOn: Date
	readonly eventName: string
	readonly payload: T
	constructor(eventName: string, payload: T) {
		this.occurredOn = new Date()
		this.eventName = eventName
		this.payload = payload
	}
}
