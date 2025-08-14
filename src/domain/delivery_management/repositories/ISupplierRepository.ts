import { IRepository } from "../../../core/interfaces/Repository.js";
import { Supplier } from "../entities/supplier/Supplier.js";
import { SupplierName } from "../entities/supplier/value_objects/SupplierName.js";

export interface ISupplierRepository extends IRepository<Supplier> {
  findByName(name: SupplierName): Promise<Supplier | null>;
}
