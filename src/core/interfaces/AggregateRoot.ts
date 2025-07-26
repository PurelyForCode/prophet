import { DomainEvent } from "./DomainEvent.js";
import { Entity } from "./Entity.js";

export enum EntityAction {
  deleted,
  created,
  updated,
}

export interface ChangedEntity {
  entity: Entity;
  action: EntityAction;
}

export abstract class AggregateRoot extends Entity {
  private domainEvents: DomainEvent[] = [];
  private trackedEntities: Map<string, ChangedEntity> = new Map();

  getDomainEvent() {
    return this.domainEvents;
  }

  addDomainEvent(domainEvent: DomainEvent) {
    this.domainEvents.push(domainEvent);
  }

  clearDomainEvent() {
    this.domainEvents = [];
  }

  getTrackedEntities() {
    return this.trackedEntities;
  }

  addTrackedEntity(entity: Entity, action: EntityAction) {
    const key = `${entity.id}_${action}`;

    //dedupe
    if (!this.trackedEntities.has(key)) {
      const tracked = { entity, action };
      this.trackedEntities.set(key, tracked);
    }
  }

  clearTrackedEntities() {
    this.trackedEntities = new Map();
  }
}
