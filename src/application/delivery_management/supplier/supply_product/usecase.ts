import { IIdGenerator } from "../../../../core/interfaces/IIdGenerator.js"
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../../core/interfaces/Usecase.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { SuppliedProductMax } from "../../../../domain/delivery_management/entities/supplied_product/value_objects/SuppliedProductMax.js"
import { SuppliedProductMin } from "../../../../domain/delivery_management/entities/supplied_product/value_objects/SuppliedProductMin.js"
import { SupplierNotFoundException } from "../../../../domain/delivery_management/exceptions/SupplierNotFoundException.js"
import { ProductNotFoundException } from "../../../../domain/product_management/exceptions/ProductNotFoundException.js"

export type CreateSuppliedProductInput = {
	supplierId: EntityId
	productId: EntityId
	max: number
	min: number
}

export class CreateSuppliedProductUsecase implements Usecase<any, any> {
	constructor(
		private readonly uow: IUnitOfWork,
		private readonly idGenerator: IIdGenerator,
	) {}

	async call(input: CreateSuppliedProductInput): Promise<any> {
		const supplierRepo = this.uow.getSupplierRepository()
		const suppliedProductRepo = this.uow.getSuppliedProductRepository()
		const productRepo = this.uow.getProductRepository()
		const supplier = await supplierRepo.findById(input.supplierId)
		if (!supplier) {
			throw new SupplierNotFoundException()
		}
		if (!(await productRepo.exists(input.productId))) {
			throw new ProductNotFoundException()
		}
		let isDefault = false
		const hasDefaultSupplier =
			await suppliedProductRepo.doesProductHaveDefaultSupplier(
				input.productId,
			)
		if (!hasDefaultSupplier) {
			isDefault = true
		}
		supplier.addSuppliedProduct(
			this.idGenerator.generate(),
			input.productId,
			new SuppliedProductMax(input.max),
			new SuppliedProductMin(input.min),
			isDefault,
		)

		await this.uow.save(supplier)
	}
}
