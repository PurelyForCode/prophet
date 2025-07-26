import { EntityId } from "../types/EntityId.js";

export interface DAO<T, K> {
  insert(table: T): Promise<void>;
  update(table: T): Promise<void>;
  delete(id: EntityId): Promise<void>;
  queryById(id: EntityId, filters?: any): Promise<K | null>;
}
