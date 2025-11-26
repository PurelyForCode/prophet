import { IEventBus } from "../../../../core/interfaces/IDomainEventBus.js"
import { IIdGenerator } from "../../../../core/interfaces/IIdGenerator.js"
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { LeadTime } from "../../../../domain/delivery_management/entities/supplier/value_objects/LeadTime.js"
import { SupplierName } from "../../../../domain/delivery_management/entities/supplier/value_objects/SupplierName.js"
import { SupplierNotFoundException } from "../../../../domain/delivery_management/exceptions/SupplierNotFoundException.js"
import { SupplierManager } from "../../../../domain/delivery_management/services/SupplierManager.js"

export type DeleteSupplierInput = {
	supplierId: EntityId
}

export class DeleteSupplierUsecase {
	constructor(private readonly uow: IUnitOfWork) {}
	async call(input: DeleteSupplierInput) {
		const supplierRepo = this.uow.getSupplierRepository()
		const supplier = await supplierRepo.findById(input.supplierId)
		if (!supplier) {
			throw new SupplierNotFoundException()
		}
		const supplierManager = new SupplierManager()
		supplierManager.archiveSupplier(supplier)
		await this.uow.save(supplier)
	}
}
