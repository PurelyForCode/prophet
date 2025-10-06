import { IEventBus } from "../../../../core/interfaces/IDomainEventBus.js"
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js"
import { CategoryNotFoundException } from "../../../../domain/product_management/exceptions/CategoryNotFoundException.js"
import { ProductGroupNotFoundException } from "../../../../domain/product_management/exceptions/ProductGroupNotFoundException.js"

type AddProductInCategoryInput = {
	categoryId: string
	groupId: string
}

export class AddProductInCategoryUsecase {
	constructor(
		private readonly uow: IUnitOfWork,
		private readonly eventBus: IEventBus,
	) {}
	async call(input: AddProductInCategoryInput) {
		const categoryRepo = this.uow.getCategoryRepository()
		const groupRepo = this.uow.getProductGroupRepository()
		const category = await categoryRepo.findById(input.categoryId)
		if (!category) {
			throw new CategoryNotFoundException()
		}

		const group = await groupRepo.findById(input.groupId)
		if (!group) {
			throw new ProductGroupNotFoundException()
		}
		group.joinCategory(category.id)
		await this.uow.save(group)
		await this.eventBus.dispatchAggregateEvents(group, this.uow)
	}
}
