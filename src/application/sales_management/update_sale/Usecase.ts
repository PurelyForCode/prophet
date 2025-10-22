import { IEventBus } from "../../../core/interfaces/IDomainEventBus.js"
import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { ProductDoesNotBelongInGroupException } from "../../../domain/product_management/exceptions/ProductDoesNotBelongInGroupException.js"
import { ProductGroupNotFoundException } from "../../../domain/product_management/exceptions/ProductGroupNotFoundException.js"
import { ProductNotFoundException } from "../../../domain/product_management/exceptions/ProductNotFoundException.js"
import { SaleQuantity } from "../../../domain/sales/entities/sale/value_objects/SaleQuantity.js"
import { SaleStatus } from "../../../domain/sales/entities/sale/value_objects/SaleStatus.js"
import { InvalidSaleTargetException } from "../../../domain/sales/exceptions/InvalidSaleTargetException.js"
import { SaleNotFoundException } from "../../../domain/sales/exceptions/SaleNotFoundException.js"
import { SaleService } from "../../../domain/sales/services/SaleService.js"

type UpdateSaleInput = {
	fields: Partial<{
		quantity: number
		status: string
		date: Date
	}>
	saleId: EntityId
	productId: EntityId
	groupId: EntityId
}

export class UpdateSaleUsecase implements Usecase<UpdateSaleInput> {
	constructor(
		private readonly uow: IUnitOfWork,
		private readonly eventBus: IEventBus,
	) {}
	async call(input: UpdateSaleInput) {
		const groupRepo = this.uow.getProductGroupRepository()
		const productRepo = this.uow.getProductRepository()
		const saleRepo = this.uow.getSaleRepository()
		const groupExists = await groupRepo.exists(input.groupId)
		if (!groupExists) {
			throw new ProductGroupNotFoundException()
		}
		const product = await productRepo.findById(input.productId)
		if (!product) {
			throw new ProductNotFoundException()
		}
		if (product.productGroupId !== input.groupId) {
			throw new ProductDoesNotBelongInGroupException()
		}
		const sale = await saleRepo.findById(input.saleId)
		if (!sale) {
			throw new SaleNotFoundException()
		}
		if (input.productId !== sale.getProductId()) {
			throw new InvalidSaleTargetException()
		}
		const saleService = new SaleService()

		let date = undefined
		let quantity = undefined
		let status = undefined
		if (input.fields.date) {
			date = input.fields.date
		}
		if (input.fields.quantity) {
			quantity = new SaleQuantity(input.fields.quantity)
		}
		if (input.fields.status) {
			status = new SaleStatus(input.fields.status)
		}
		saleService.updateSale(
			{
				date,
				quantity,
				status,
			},
			sale,
		)
		await this.uow.save(sale)
		await this.eventBus.dispatchAggregateEvents(sale, this.uow)
	}
}
