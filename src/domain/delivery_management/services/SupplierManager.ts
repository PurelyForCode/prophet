import { EntityAction } from "../../../core/interfaces/AggregateRoot.js";
import { Entity } from "../../../core/interfaces/Entity.js";
import { EntityId } from "../../../core/types/EntityId.js";
import { SupplierRepository } from "../../../infra/repositories/SupplierRepository.js";
import {
  Supplier,
  UpdateSupplierFields,
} from "../entities/supplier/Supplier.js";
import { LeadTime } from "../entities/supplier/value_objects/LeadTime.js";
import { SupplierName } from "../entities/supplier/value_objects/SupplierName.js";
import { SupplierDuplicateNameException } from "../exceptions/SupplierDuplicateNameException.js";
import { ISupplierRepository } from "../repositories/ISupplierRepository.js";

export class SupplierManager {
  async createSupplier(
    supplierRepo: ISupplierRepository,
    fields: {
      id: EntityId;
      accountId: EntityId;
      name: SupplierName;
      leadTime: LeadTime;
    }
  ) {
    const doesNameExist = await supplierRepo.findByName(fields.name);
    if (doesNameExist) {
      throw new SupplierDuplicateNameException();
    }
    const now = new Date();
    const leadTimeValueObject = fields.leadTime;
    const supplier = Supplier.create(
      fields.id,
      fields.accountId,
      fields.name,
      leadTimeValueObject,
      now,
      now,
      null,
      new Map()
    );
    supplier.addTrackedEntity(supplier, EntityAction.created);
    return supplier;
  }

  deleteSupplier(supplier: Supplier) {
    supplier.addTrackedEntity(supplier, EntityAction.deleted);
  }

  archiveSupplier(supplier: Supplier) {
    supplier.archive();
  }

  updateSupplier(
    supplier: Supplier,
    updatedAt: Date,
    fields: UpdateSupplierFields
  ) {
    if (fields.leadTime) {
      supplier.leadTime = fields.leadTime;
    }
    if (fields.name) {
      supplier.name = fields.name;
    }
    supplier.updatedAt = updatedAt;
    supplier.addTrackedEntity(supplier, EntityAction.updated);
    return supplier;
  }
}
