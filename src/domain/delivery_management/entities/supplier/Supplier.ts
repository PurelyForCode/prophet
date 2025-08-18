import {
  AggregateRoot,
  EntityAction,
} from "../../../../core/interfaces/AggregateRoot.js";
import { EntityCollection } from "../../../../core/types/EntityCollection.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { SuppliedProduct } from "../supplied_product/SuppliedProduct.js";
import { LeadTime } from "./value_objects/LeadTime.js";
import { SupplierName } from "./value_objects/SupplierName.js";

export type UpdateSupplierFields = Partial<{
  name: SupplierName;
  leadTime: LeadTime;
}>;

export class Supplier extends AggregateRoot {
  private constructor(
    id: EntityId,
    private accountId: EntityId,
    private name: SupplierName,
    private leadTime: LeadTime,
    private createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null,
    private suppliedProducts: EntityCollection<SuppliedProduct>
  ) {
    super(id);
  }

  static create(params: {
    id: EntityId;
    accountId: EntityId;
    name: SupplierName;
    leadTime: LeadTime;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    productsSupplied: EntityCollection<SuppliedProduct>;
  }) {
    return new Supplier(
      params.id,
      params.accountId,
      params.name,
      params.leadTime,
      params.createdAt,
      params.updatedAt,
      params.deletedAt,
      params.productsSupplied
    );
  }

  // TODO
  addSuppliedProduct(product: SuppliedProduct) {}
  removeSuppliedProduct(productId: SuppliedProduct) {}
  updateSuppliedProduct(productId: SuppliedProduct) {}

  archive() {
    this.deletedAt = new Date();
    this.addTrackedEntity(this, EntityAction.deleted);
  }

  public getSuppliedProducts(): EntityCollection<SuppliedProduct> {
    return this.suppliedProducts;
  }
  public setSuppliedProducts(value: EntityCollection<SuppliedProduct>) {
    this.suppliedProducts = value;
  }
  public getDeletedAt(): Date | null {
    return this.deletedAt;
  }
  public setDeletedAt(value: Date | null) {
    this.deletedAt = value;
  }
  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
  public setUpdatedAt(value: Date) {
    this.updatedAt = value;
  }
  public getCreatedAt(): Date {
    return this.createdAt;
  }
  public setCreatedAt(value: Date) {
    this.createdAt = value;
  }
  public getLeadTime(): LeadTime {
    return this.leadTime;
  }
  public setLeadTime(value: LeadTime) {
    this.leadTime = value;
  }
  public getName(): SupplierName {
    return this.name;
  }
  public setName(value: SupplierName) {
    this.name = value;
  }
  public getAccountId(): EntityId {
    return this.accountId;
  }
  public setAccountId(value: EntityId) {
    this.accountId = value;
  }
}
