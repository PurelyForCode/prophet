import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../../core/interfaces/Usecase.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { SupplierNotFoundException } from "../../../../domain/delivery_management/exceptions/SupplierNotFoundException.js"

export type RemoveSuppliedProductInput = {
	supplierId: EntityId
	productId: EntityId
}

export class RemoveSuppliedProductUsecase implements Usecase<any, any> {
	constructor(private readonly uow: IUnitOfWork) {}

	async call(input: RemoveSuppliedProductInput): Promise<any> {
		const supplierRepo = this.uow.getSupplierRepository()
		const supplier = await supplierRepo.findById(input.supplierId)
		if (!supplier) {
			throw new SupplierNotFoundException()
		}
		supplier.removeSuppliedProduct(input.productId)
		await this.uow.save(supplier)
	}
}
