import { DomainEvent } from "../../../core/interfaces/DomainEvent.js";
import { EntityId } from "../../../core/types/EntityId.js";

export class ProductCreatedDomainEvent extends DomainEvent<{
  productId: EntityId;
}> {
  constructor(payload: { productId: EntityId }) {
    super("PRODUCT_CREATED", payload);
  }
}
