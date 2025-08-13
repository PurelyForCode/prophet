import { Entity } from "../../../../core/interfaces/Entity.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { SuppliedProductMax } from "./value_objects/SuppliedProductMax.js";
import { SuppliedProductMin } from "./value_objects/SuppliedProductMin.js";

export class SuppliedProduct extends Entity {
  public get max(): SuppliedProductMax {
    return this._max;
  }
  public set max(value: SuppliedProductMax) {
    this._max = value;
  }
  public get min(): SuppliedProductMin {
    return this._min;
  }
  public set min(value: SuppliedProductMin) {
    this._min = value;
  }
  public get supplierId(): EntityId {
    return this._supplierId;
  }
  public set supplierId(value: EntityId) {
    this._supplierId = value;
  }
  public get varaintId(): EntityId | null {
    return this._varaintId;
  }
  public set varaintId(value: EntityId | null) {
    this._varaintId = value;
  }
  public get productId(): EntityId {
    return this._productId;
  }
  public set productId(value: EntityId) {
    this._productId = value;
  }
  private constructor(
    id: EntityId,
    private _productId: EntityId,
    private _varaintId: EntityId | null,
    private _supplierId: EntityId,
    private _min: SuppliedProductMin,
    private _max: SuppliedProductMax
  ) {
    super(id);
  }

  static create(
    id: EntityId,
    productId: EntityId,
    varaintId: EntityId | null,
    supplierId: EntityId,
    min: SuppliedProductMin,
    max: SuppliedProductMax
  ) {
    return new SuppliedProduct(id, productId, varaintId, supplierId, min, max);
  }
}
