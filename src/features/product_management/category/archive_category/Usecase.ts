import { IDomainEventBus } from "../../../../core/interfaces/IDomainEventBus.js";
import { IIdGenerator } from "../../../../core/interfaces/IIdGenerator.js";
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js";
import { Usecase } from "../../../../core/interfaces/Usecase.js";
import { CategoryManager } from "../../../../domain/product_management/services/CategoryManager.js";
import { CategoryName } from "../../../../domain/product_management/entities/category/value_objects/CategoryName.js";
import { CategoryNotFoundException } from "../../../../domain/product_management/exceptions/CategoryNotFoundException.js";
import { ProductManager } from "../../../../domain/product_management/services/ProductManager.js";

export type ArchiveCategoryInput = {
  categoryId: string;
};

export class ArchiveCategoryUsecase implements Usecase<any, any> {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly eventBus: IDomainEventBus
  ) {}

  async call(input: ArchiveCategoryInput) {
    const categoryRepo = this.uow.getCategoryRepository();
    const productRepo = this.uow.getProductRepository();
    const categoryManager = new CategoryManager();
    const category = await categoryRepo.findById(input.categoryId);
    if (!category) {
      throw new CategoryNotFoundException();
    }
    categoryManager.archiveCategory(category);
    const productManager = new ProductManager();
    const products = await productRepo.findAllByCategoryId(category.id);

    for (const value of products.values()) {
      productManager.archiveProduct(value);
      await this.uow.save(value);
      await this.eventBus.dispatch(value, this.uow);
    }

    await this.uow.save(category);
    await this.eventBus.dispatch(category, this.uow);
  }
}
