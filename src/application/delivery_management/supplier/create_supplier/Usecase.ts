import { IEventBus } from "../../../../core/interfaces/IDomainEventBus.js"
import { IIdGenerator } from "../../../../core/interfaces/IIdGenerator.js"
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { Supplier } from "../../../../domain/delivery_management/entities/supplier/Supplier.js"
import { LeadTime } from "../../../../domain/delivery_management/entities/supplier/value_objects/LeadTime.js"
import { SupplierName } from "../../../../domain/delivery_management/entities/supplier/value_objects/SupplierName.js"
import { SupplierManager } from "../../../../domain/delivery_management/services/SupplierManager.js"

export type CreateSupplierInput = {
	accountId: EntityId
	name: string
	leadTime: number
}
export class CreateSupplierUsecase {
	constructor(
		private readonly uow: IUnitOfWork,
		private readonly eventBus: IEventBus,
		private readonly idGenerator: IIdGenerator,
	) {}
	async call(input: CreateSupplierInput) {
		const supplierManager = new SupplierManager()
		const supplierRepo = this.uow.getSupplierRepository()
		const id = this.idGenerator.generate()
		const name = new SupplierName(input.name)
		const leadTime = new LeadTime(input.leadTime)
		const supplier = await supplierManager.createSupplier(supplierRepo, {
			id: id,
			accountId: input.accountId,
			leadTime: leadTime,
			name: name,
		})
		await this.uow.save(supplier)
	}
}
