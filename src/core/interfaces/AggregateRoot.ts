import { EntityId } from "../types/EntityId.js"
import { DomainEvent } from "./DomainEvent.js"
import { Entity } from "./Entity.js"

export enum EntityAction {
	deleted,
	created,
	updated,
}

export interface ChangedEntity {
	entity: Entity
	action: EntityAction
}

export abstract class AggregateRoot<T = EntityId> extends Entity<T> {
	private domainEvents: DomainEvent<any>[] = []
	private trackedEntities: Map<string, ChangedEntity> = new Map()

	getDomainEvent() {
		return this.domainEvents
	}

	addDomainEvent(domainEvent: DomainEvent<any>) {
		this.domainEvents.push(domainEvent)
	}

	clearDomainEvent() {
		this.domainEvents = []
	}

	getTrackedEntities() {
		return this.trackedEntities
	}

	addTrackedEntity(entity: Entity<any>, action: EntityAction) {
		const key = `${entity.key()}_${action}`

		//dedupe
		if (!this.trackedEntities.has(key)) {
			const tracked = { entity, action }
			this.trackedEntities.set(key, tracked)
		}
	}

	clearTrackedEntities() {
		this.trackedEntities = new Map()
	}
}
