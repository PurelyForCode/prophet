import { EntityId } from "../types/EntityId.js"

export interface BaseRepository<T> {
	delete(entity: T): Promise<void>
	update(entity: T): Promise<void>
	create(entity: T): Promise<void>
}

export interface IRepository<T> extends BaseRepository<T> {
	findById(id: EntityId): Promise<T | null>
}
