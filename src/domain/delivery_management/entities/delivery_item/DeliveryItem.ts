import { Entity } from "../../../../core/interfaces/Entity.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { DeliveryItemQuantity } from "./value_objects/DeliveryItemQuantity.js";

export type UpdateDeliveryItemFields = Partial<{
  quantity: DeliveryItemQuantity;
}>;

export class DeliveryItem extends Entity {
  private constructor(
    id: EntityId,
    private _productId: EntityId,
    private _variantId: EntityId | null,
    private _deliveryId: EntityId,
    private _quantity: DeliveryItemQuantity
  ) {
    super(id);
  }

  public static create(
    id: EntityId,
    productId: EntityId,
    variantId: EntityId | null,
    deliveryId: EntityId,
    quantity: DeliveryItemQuantity
  ) {
    return new DeliveryItem(id, productId, variantId, deliveryId, quantity);
  }

  public get quantity(): DeliveryItemQuantity {
    return this._quantity;
  }
  public set quantity(value: DeliveryItemQuantity) {
    this._quantity = value;
  }
  public get deliveryId(): EntityId {
    return this._deliveryId;
  }
  public set deliveryId(value: EntityId) {
    this._deliveryId = value;
  }
  public get variantId(): EntityId | null {
    return this._variantId;
  }
  public set variantId(value: EntityId | null) {
    this._variantId = value;
  }
  public get productId(): EntityId {
    return this._productId;
  }
  public set productId(value: EntityId) {
    this._productId = value;
  }
}
