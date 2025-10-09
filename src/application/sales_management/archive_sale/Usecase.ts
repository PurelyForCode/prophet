import { IEventBus } from "../../../core/interfaces/IDomainEventBus.js"
import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { ProductDoesNotBelongInGroupException } from "../../../domain/product_management/exceptions/ProductDoesNotBelongInGroupException.js"
import { ProductGroupNotFoundException } from "../../../domain/product_management/exceptions/ProductGroupNotFoundException.js"
import { ProductNotFoundException } from "../../../domain/product_management/exceptions/ProductNotFoundException.js"
import { InvalidSaleTargetException } from "../../../domain/sales/exceptions/InvalidSaleTargetException.js"
import { SaleNotFoundException } from "../../../domain/sales/exceptions/SaleNotFoundException.js"
import { SaleService } from "../../../domain/sales/services/SaleService.js"

export type ArchiveSaleInput = {
	groupId: EntityId
	saleId: EntityId
	productId: EntityId
}

export class ArchiveSaleUsecase implements Usecase<ArchiveSaleInput> {
	constructor(
		private readonly uow: IUnitOfWork,
		private readonly eventBus: IEventBus,
	) {}
	async call(input: ArchiveSaleInput): Promise<void> {
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
		saleService.archiveSale(sale)

		await this.uow.save(sale)
		await this.eventBus.dispatchAggregateEvents(sale, this.uow)
	}
}
