import { IEventBus } from "../../../../core/interfaces/IDomainEventBus.js"
import { IIdGenerator } from "../../../../core/interfaces/IIdGenerator.js"
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../../core/interfaces/Usecase.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { ProductName } from "../../../../domain/product_management/entities/product/value_objects/ProductName.js"
import { ProductSetting } from "../../../../domain/product_management/entities/product/value_objects/ProductSetting.js"
import { ProductStock } from "../../../../domain/product_management/entities/product/value_objects/ProductStock.js"
import { ProductGroupNotFoundException } from "../../../../domain/product_management/exceptions/ProductGroupNotFoundException.js"

export type CreateProductInput = {
	groupId: EntityId
	name: string
	accountId: EntityId
	settings:
		| {
				serviceLevel: number
				safetyStockCalculationMethod: string
				classification: string
				fillRate: number
		  }
		| undefined
}

export class CreateProductUsecase implements Usecase<any, any> {
	constructor(
		private readonly uow: IUnitOfWork,
		private readonly eventBus: IEventBus,
		private readonly idGenerator: IIdGenerator,
	) {}
	async call(input: CreateProductInput) {
		const groupRepo = this.uow.getProductGroupRepository()
		const group = await groupRepo.findById(input.groupId)
		if (!group) {
			throw new ProductGroupNotFoundException()
		}
		const productName = new ProductName(input.name)
		const productStock = new ProductStock(0)
		const now = new Date()
		let productSettings: ProductSetting
		if (input.settings) {
			productSettings = new ProductSetting(
				input.settings.serviceLevel,
				input.settings.safetyStockCalculationMethod,
				input.settings.classification,
				input.settings.fillRate,
				now,
			)
		} else {
			productSettings = ProductSetting.defaultConfiguration(now)
		}

		group.addVariant(
			this.idGenerator.generate(),
			input.accountId,
			productName,
			productStock,
			productSettings,
		)

		await this.eventBus.dispatchAggregateEvents(group, this.uow)
		await this.uow.save(group)
	}
}
