import { EntityAction } from "../../../core/interfaces/AggregateRoot.js"
import { EntityId } from "../../../core/types/EntityId.js"
import {
	Supplier,
	UpdateSupplierFields,
} from "../entities/supplier/Supplier.js"
import { LeadTime } from "../entities/supplier/value_objects/LeadTime.js"
import { SupplierName } from "../entities/supplier/value_objects/SupplierName.js"
import { SupplierDuplicateNameException } from "../exceptions/SupplierDuplicateNameException.js"
import { ISupplierRepository } from "../repositories/ISupplierRepository.js"

export class SupplierManager {
	async createSupplier(
		supplierRepo: ISupplierRepository,
		fields: {
			id: EntityId
			accountId: EntityId
			name: SupplierName
			leadTime: LeadTime
		},
	) {
		const doesNameExist = await supplierRepo.findByName(fields.name)
		if (doesNameExist) {
			throw new SupplierDuplicateNameException()
		}
		const now = new Date()
		const leadTimeValueObject = fields.leadTime
		const supplier = Supplier.create({
			id: fields.id,
			accountId: fields.accountId,
			name: fields.name,
			leadTime: leadTimeValueObject,
			createdAt: now,
			updatedAt: now,
			deletedAt: null,
			productsSupplied: new Map(),
		})
		supplier.addTrackedEntity(supplier, EntityAction.created)
		return supplier
	}

	deleteSupplier(supplier: Supplier) {
		supplier.addTrackedEntity(supplier, EntityAction.deleted)
	}

	archiveSupplier(supplier: Supplier) {
		supplier.archive()
	}

	updateSupplier(
		supplier: Supplier,
		updatedAt: Date,
		fields: UpdateSupplierFields,
	) {
		if (fields.leadTime) {
			supplier.setLeadTime(fields.leadTime)
		}
		if (fields.name) {
			supplier.setName(fields.name)
		}
		supplier.setUpdatedAt(updatedAt)
		supplier.addTrackedEntity(supplier, EntityAction.updated)
		return supplier
	}
}
