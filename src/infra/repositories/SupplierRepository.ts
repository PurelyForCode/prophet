import { Knex } from "knex";
import { EntityId } from "../../core/types/EntityId.js";
import { Supplier } from "../../domain/delivery_management/entities/supplier/Supplier.js";
import { ISupplierRepository } from "../../domain/delivery_management/repositories/ISupplierRepository.js";
import { SupplierDAO, SupplierDTO } from "../dao/SupplierDAO.js";
import { EntityCollection } from "../../core/types/EntityCollection.js";
import { SupplierName } from "../../domain/delivery_management/entities/supplier/value_objects/SupplierName.js";
import { SuppliedProduct } from "../../domain/delivery_management/entities/supplied_product/SuppliedProduct.js";
import { SuppliedProductRepository } from "./SuppliedProductRepository.js";
import { LeadTime } from "../../domain/delivery_management/entities/supplier/value_objects/LeadTime.js";

export class SupplierRepository implements ISupplierRepository {
  private supplierDAO: SupplierDAO;
  private suppliedProductRepo: SuppliedProductRepository;

  constructor(knex: Knex) {
    this.suppliedProductRepo = new SuppliedProductRepository(knex);
    this.supplierDAO = new SupplierDAO(knex);
  }

  async findByName(name: SupplierName): Promise<Supplier | null> {
    const supplierDTO = await this.supplierDAO.findByName(name.value);
    if (!supplierDTO) {
      return null;
    }
    const suppliedProducts = await this.suppliedProductRepo.findAllBySupplierId(
      supplierDTO.id
    );
    return this.mapToEntity(supplierDTO, suppliedProducts);
  }

  async delete(entity: Supplier): Promise<void> {
    await this.supplierDAO.delete(entity.id);
  }
  async update(entity: Supplier): Promise<void> {
    await this.supplierDAO.update({
      account_id: entity.accountId,
      created_at: entity.createdAt,
      deleted_at: entity.deletedAt,
      id: entity.id,
      lead_time: entity.leadTime.value,
      name: entity.name.value,
      updated_at: entity.updatedAt,
    });
  }
  async create(entity: Supplier): Promise<void> {
    await this.supplierDAO.insert({
      account_id: entity.accountId,
      created_at: entity.createdAt,
      deleted_at: entity.deletedAt,
      id: entity.id,
      lead_time: entity.leadTime.value,
      name: entity.name.value,
      updated_at: entity.updatedAt,
    });
  }

  async findById(id: EntityId): Promise<Supplier | null> {
    const supplierDTO = await this.supplierDAO.findById(id);
    if (!supplierDTO) {
      return null;
    }
    const suppliedProducts = await this.suppliedProductRepo.findAllBySupplierId(
      supplierDTO.id
    );
    return this.mapToEntity(supplierDTO, suppliedProducts);
  }

  private mapToEntity(
    supplierDTO: SupplierDTO,
    suppliedProducts: EntityCollection<SuppliedProduct>
  ) {
    const name = new SupplierName(supplierDTO.name);
    const leadTime = new LeadTime(supplierDTO.leadTime);
    return Supplier.create(
      supplierDTO.id,
      supplierDTO.accountId,
      name,
      leadTime,
      supplierDTO.createdAt,
      supplierDTO.updatedAt,
      supplierDTO.deletedAt,
      suppliedProducts
    );
  }
}
