import { EntityId } from "../types/EntityId.js";

export interface Repository<T> {
  delete(entity: T): Promise<void>;
  update(entity: T): Promise<void>;
  create(entity: T): Promise<void>;
  findById(id: EntityId): Promise<T | null>;
}
