import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { Supplier } from "../../../domain/delivery_management/entities/supplier/Supplier.js"
import { ISupplierRepository } from "../../../domain/delivery_management/repositories/ISupplierRepository.js"
import { SupplierDAO, SupplierDTO } from "../dao/SupplierDao.js"
import { EntityCollection } from "../../../core/types/EntityCollection.js"
import { SupplierName } from "../../../domain/delivery_management/entities/supplier/value_objects/SupplierName.js"
import { SuppliedProduct } from "../../../domain/delivery_management/entities/supplied_product/SuppliedProduct.js"
import { SuppliedProductRepository } from "./SuppliedProductRepository.js"
import { LeadTime } from "../../../domain/delivery_management/entities/supplier/value_objects/LeadTime.js"

export class SupplierRepository implements ISupplierRepository {
	private supplierDAO: SupplierDAO
	private suppliedProductRepo: SuppliedProductRepository

	constructor(knex: Knex) {
		this.suppliedProductRepo = new SuppliedProductRepository(knex)
		this.supplierDAO = new SupplierDAO(knex)
	}
	async findDefaultSupplier(productId: EntityId): Promise<Supplier | null> {
		const supplierDTO =
			await this.supplierDAO.findDefaultSupplier(productId)
		if (!supplierDTO) {
			return null
		}
		const suppliedProducts =
			await this.suppliedProductRepo.findAllBySupplierId(supplierDTO.id)
		return this.mapToEntity(supplierDTO, suppliedProducts)
	}

	async findByName(name: SupplierName): Promise<Supplier | null> {
		const supplierDTO = await this.supplierDAO.findByName(name.value)
		if (!supplierDTO) {
			return null
		}
		const suppliedProducts =
			await this.suppliedProductRepo.findAllBySupplierId(supplierDTO.id)
		return this.mapToEntity(supplierDTO, suppliedProducts)
	}

	async delete(entity: Supplier): Promise<void> {
		await this.supplierDAO.delete(entity.id)
	}

	async update(entity: Supplier): Promise<void> {
		await this.supplierDAO.update({
			account_id: entity.getAccountId(),
			created_at: entity.getCreatedAt(),
			deleted_at: entity.getDeletedAt(),
			id: entity.id,
			lead_time: entity.getLeadTime().value,
			name: entity.getName().value,
			updated_at: entity.getUpdatedAt(),
		})
	}
	async create(entity: Supplier): Promise<void> {
		await this.supplierDAO.insert({
			account_id: entity.getAccountId(),
			created_at: entity.getCreatedAt(),
			deleted_at: entity.getDeletedAt(),
			id: entity.id,
			lead_time: entity.getLeadTime().value,
			name: entity.getName().value,
			updated_at: entity.getUpdatedAt(),
		})
	}

	async findById(id: EntityId): Promise<Supplier | null> {
		const supplierDTO = await this.supplierDAO.findById(id)
		if (!supplierDTO) {
			return null
		}
		const suppliedProducts =
			await this.suppliedProductRepo.findAllBySupplierId(supplierDTO.id)
		return this.mapToEntity(supplierDTO, suppliedProducts)
	}

	private mapToEntity(
		supplierDTO: SupplierDTO,
		suppliedProducts: EntityCollection<SuppliedProduct>,
	) {
		const name = new SupplierName(supplierDTO.name)
		const leadTime = new LeadTime(supplierDTO.leadTime)
		return Supplier.create({
			id: supplierDTO.id,
			accountId: supplierDTO.accountId,
			name: name,
			leadTime: leadTime,
			createdAt: supplierDTO.createdAt,
			updatedAt: supplierDTO.updatedAt,
			deletedAt: supplierDTO.deletedAt,
			productsSupplied: suppliedProducts,
		})
	}
}
