import { DomainEvent } from "../../../../../core/interfaces/DomainEvent.js"
import { DomainEventHandler } from "../../../../../core/interfaces/IDomainEventBus.js"
import { IUnitOfWork } from "../../../../../core/interfaces/IUnitOfWork.js"
import { DefaultProductSupplierChangedDomainEvent } from "../../../../../domain/delivery_management/events/DefaultProductSupplierChangedDomainEvent.js"
import { DeliveryManagementDomainEventList } from "../../../../../domain/delivery_management/events/DeliveryManagementDomainEventList.js"

export class ReplaceDefaultProductSupplierHandler
	implements DomainEventHandler
{
	eventName =
		DeliveryManagementDomainEventList.DEFAULT_PRODUCT_SUPPLIER_CHANGED
	handle(
		event: DefaultProductSupplierChangedDomainEvent,
		uow: IUnitOfWork,
	): Promise<void> {
		uow.getSuppliedProductRepository()
		return
	}
}
