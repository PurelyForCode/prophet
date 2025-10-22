import { IEventBus } from "../../../../core/interfaces/IDomainEventBus.js"
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { LeadTime } from "../../../../domain/delivery_management/entities/supplier/value_objects/LeadTime.js"
import { SupplierName } from "../../../../domain/delivery_management/entities/supplier/value_objects/SupplierName.js"
import { SupplierManager } from "../../../../domain/delivery_management/services/SupplierManager.js"
import { SupplierNotFoundException } from "../../../../domain/delivery_management/exceptions/SupplierNotFoundException.js"

export type UpdateSupplierInput = {
	supplierId: EntityId
	fields: Partial<{
		name: string
		leadTime: number
	}>
}
export class UpdateSupplierUsecase {
	constructor(
		private readonly uow: IUnitOfWork,
		private readonly eventBus: IEventBus,
	) {}
	async call(input: UpdateSupplierInput) {
		const supplierManager = new SupplierManager()
		const supplierRepo = this.uow.getSupplierRepository()
		const supplier = await supplierRepo.findById(input.supplierId)
		if (!supplier) {
			throw new SupplierNotFoundException()
		}
		let name = undefined
		let leadTime = undefined
		if (input.fields.name) {
			name = new SupplierName(input.fields.name)
		}
		//TODO: Update the deliveries scheduled arrival time
		if (input.fields.leadTime) {
			leadTime = new LeadTime(input.fields.leadTime)
		}
		const now = new Date()
		supplierManager.updateSupplier(supplier, now, {
			leadTime: leadTime,
			name: name,
		})
		await this.uow.save(supplier)
	}
}
