import { IEventBus } from "../../../../core/interfaces/IDomainEventBus.js";
import { IIdGenerator } from "../../../../core/interfaces/IIdGenerator.js";
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js";
import { Usecase } from "../../../../core/interfaces/Usecase.js";
import { CategoryManager } from "../../../../domain/product_management/services/CategoryManager.js";
import { CategoryNotFoundException } from "../../../../domain/product_management/exceptions/CategoryNotFoundException.js";
import { CategoryName } from "../../../../domain/product_management/entities/category/value_objects/CategoryName.js";

export type UpdateCategoryInput = {
  categoryId: string;
  name: string;
};

export class UpdateCategoryUsecase implements Usecase<any, any> {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly eventBus: IEventBus
  ) {}
  async call(input: UpdateCategoryInput) {
    const categoryRepo = this.uow.getCategoryRepository();
    const categoryManager = new CategoryManager();
    const category = await categoryRepo.findById(input.categoryId);
    if (!category) {
      throw new CategoryNotFoundException();
    }
    const name = new CategoryName(input.name);
    categoryManager.updateCategory(category, { name: name });

    await this.uow.save(category);
    await this.eventBus.dispatchAggregateEvents(category, this.uow);
  }
}
