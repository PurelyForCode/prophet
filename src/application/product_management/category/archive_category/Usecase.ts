import { IEventBus } from "../../../../core/interfaces/IDomainEventBus.js"
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../../core/interfaces/Usecase.js"
import { CategoryManager } from "../../../../domain/product_management/services/CategoryManager.js"
import { CategoryNotFoundException } from "../../../../domain/product_management/exceptions/CategoryNotFoundException.js"

export type ArchiveCategoryInput = {
	categoryId: string
}

export class ArchiveCategoryUsecase implements Usecase<any, any> {
	constructor(
		private readonly uow: IUnitOfWork,
		private readonly eventBus: IEventBus,
	) {}

	async call(input: ArchiveCategoryInput) {
		const categoryRepo = this.uow.getCategoryRepository()
		const groupRepo = this.uow.getProductGroupRepository()
		const categoryManager = new CategoryManager()
		const category = await categoryRepo.findById(input.categoryId)
		if (!category) {
			throw new CategoryNotFoundException()
		}
		categoryManager.archiveCategory(category)
		const groups = await groupRepo.findByCategoryId(category.id)
		for (const group of groups.values()) {
			group.leaveCategory()
			await this.uow.save(group)
			await this.eventBus.dispatchAggregateEvents(group, this.uow)
		}

		await this.uow.save(category)
		await this.eventBus.dispatchAggregateEvents(category, this.uow)
	}
}
