import { EntityId } from "../types/EntityId.js";

export interface IIdGenerator {
  generate(): EntityId;
}
