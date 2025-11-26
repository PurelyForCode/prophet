import { IEventBus } from "../../../core/interfaces/IDomainEventBus.js"
import { IIdGenerator } from "../../../core/interfaces/IIdGenerator.js"
import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { ProductDoesNotBelongInGroupException } from "../../../domain/product_management/exceptions/ProductDoesNotBelongInGroupException.js"
import { ProductGroupNotFoundException } from "../../../domain/product_management/exceptions/ProductGroupNotFoundException.js"
import { ProductNotFoundException } from "../../../domain/product_management/exceptions/ProductNotFoundException.js"
import { SaleQuantity } from "../../../domain/sales/entities/sale/value_objects/SaleQuantity.js"
import {
	SaleStatus,
	SaleStatusValues,
} from "../../../domain/sales/entities/sale/value_objects/SaleStatus.js"
import { SaleService } from "../../../domain/sales/services/SaleService.js"

export type CreateSaleInput = {
	accountId: EntityId
	productId: EntityId
	groupId: EntityId
	quantity: number
	status: SaleStatusValues
	date: Date
}

export class CreateSaleUsecase implements Usecase<CreateSaleInput> {
	constructor(
		private readonly uow: IUnitOfWork,
		private readonly idGenerator: IIdGenerator,
		private readonly eventBus: IEventBus,
	) {}
	async call(input: CreateSaleInput) {
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
		const saleService = new SaleService()
		const now = new Date()
		const quantity = new SaleQuantity(input.quantity)
		const status = new SaleStatus(input.status)
		const sale = await saleService.createSale(saleRepo, {
			id: this.idGenerator.generate(),
			accountId: input.accountId,
			productId: input.productId,
			quantity: quantity,
			status: status,
			date: input.date,
			createdAt: now,
			updatedAt: now,
			deletedAt: null,
		})
		await this.uow.save(sale)
		await this.eventBus.dispatchAggregateEvents(sale, this.uow)
	}
}
