import { v7 } from "uuid";
import { IIdGenerator } from "../../core/interfaces/IIdGenerator.js";

export class IdGenerator implements IIdGenerator {
  generate() {
    return v7();
  }
}

export const idGenerator = new IdGenerator();
