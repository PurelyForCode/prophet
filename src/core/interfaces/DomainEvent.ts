export abstract class DomainEvent {
  readonly occurredOn: Date;
  readonly eventName: string;
  readonly payload: any;
  constructor(eventName: string, payload: any) {
    this.occurredOn = new Date();
    this.eventName = eventName;
    this.payload = payload;
  }
}
