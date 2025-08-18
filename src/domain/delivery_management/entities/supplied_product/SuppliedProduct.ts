import { Entity } from "../../../../core/interfaces/Entity.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { SuppliedProductMax } from "./value_objects/SuppliedProductMax.js";
import { SuppliedProductMin } from "./value_objects/SuppliedProductMin.js";

export class SuppliedProduct extends Entity {
  getMax(): SuppliedProductMax {
    return this.max;
  }
  setMax(value: SuppliedProductMax) {
    this.max = value;
  }
  getMin(): SuppliedProductMin {
    return this.min;
  }
  setMin(value: SuppliedProductMin) {
    this.min = value;
  }
  getSupplierId(): EntityId {
    return this.supplierId;
  }
  setSupplierId(value: EntityId) {
    this.supplierId = value;
  }
  getVaraintId(): EntityId | null {
    return this.varaintId;
  }
  setVaraintId(value: EntityId | null) {
    this.varaintId = value;
  }
  getProductId(): EntityId {
    return this.productId;
  }
  setProductId(value: EntityId) {
    this.productId = value;
  }

  private constructor(
    id: EntityId,
    private productId: EntityId,
    private varaintId: EntityId | null,
    private supplierId: EntityId,
    private min: SuppliedProductMin,
    private max: SuppliedProductMax
  ) {
    super(id);
  }

  static create(params: {
    id: EntityId;
    productId: EntityId;
    varaintId: EntityId | null;
    supplierId: EntityId;
    min: SuppliedProductMin;
    max: SuppliedProductMax;
  }) {
    return new SuppliedProduct(
      params.id,
      params.productId,
      params.varaintId,
      params.supplierId,
      params.min,
      params.max
    );
  }
}
