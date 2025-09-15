import { IEventBus } from "../../../../core/interfaces/IDomainEventBus.js";
import { IIdGenerator } from "../../../../core/interfaces/IIdGenerator.js";
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js";
import { Usecase } from "../../../../core/interfaces/Usecase.js";
import { CategoryManager } from "../../../../domain/product_management/services/CategoryManager.js";
import { CategoryName } from "../../../../domain/product_management/entities/category/value_objects/CategoryName.js";

export type CreateCategoryInput = {
  accountId: string;
  name: string;
};

export class CreateCategoryUsecase implements Usecase<any, any> {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly eventBus: IEventBus,
    private readonly idGenerator: IIdGenerator
  ) {}
  async call(input: CreateCategoryInput) {
    const categoryRepo = this.uow.getCategoryRepository();
    const categoryManager = new CategoryManager();
    const name = new CategoryName(input.name);
    const category = await categoryManager.createCategory(categoryRepo, {
      accountId: input.accountId,
      id: this.idGenerator.generate(),
      name: name,
    });

    await this.uow.save(category);
    await this.eventBus.dispatchAggregateEvents(category, this.uow);
  }
}
