import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../../core/interfaces/Usecase.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { SuppliedProductMax } from "../../../../domain/delivery_management/entities/supplied_product/value_objects/SuppliedProductMax.js"
import { SuppliedProductMin } from "../../../../domain/delivery_management/entities/supplied_product/value_objects/SuppliedProductMin.js"
import { SupplierNotFoundException } from "../../../../domain/delivery_management/exceptions/SupplierNotFoundException.js"

export type UpdateSuppliedProductInput = {
	productId: EntityId
	supplierId: EntityId
	fields: Partial<{ max: number; min: number; isDefault: boolean }>
}

export class UpdateSuppliedProductUsecase implements Usecase<any, any> {
	constructor(private readonly uow: IUnitOfWork) {}

	async call(input: UpdateSuppliedProductInput): Promise<any> {
		const supplierRepo = this.uow.getSupplierRepository()
		const supplier = await supplierRepo.findById(input.supplierId)

		if (!supplier) {
			throw new SupplierNotFoundException()
		}

		const defaultSupplier = await supplierRepo.findDefaultSupplier(
			input.productId,
		)

		if (input.fields.isDefault) {
			if (defaultSupplier && defaultSupplier.id !== input.supplierId) {
				defaultSupplier.updateSuppliedProduct(input.productId, {
					isDefault: false,
				})
				await this.uow.save(defaultSupplier)
			}
		}

		supplier.updateSuppliedProduct(input.productId, {
			max:
				input.fields.max !== undefined
					? new SuppliedProductMax(input.fields.max)
					: undefined,
			min:
				input.fields.min !== undefined
					? new SuppliedProductMin(input.fields.min)
					: undefined,
			isDefault: input.fields.isDefault ?? undefined,
		})

		await this.uow.save(supplier)
	}
}
