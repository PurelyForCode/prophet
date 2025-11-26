import { EntityId } from "./EntityId.js";

export type LazyLoadedEntityCollection<T> = null | Map<EntityId, T>;
