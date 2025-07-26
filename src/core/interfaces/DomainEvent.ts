export abstract class DomainEvent {
  constructor(
    readonly name: string,
    readonly occurredOn: Date,
    readonly payload: any
  ) {}
}
