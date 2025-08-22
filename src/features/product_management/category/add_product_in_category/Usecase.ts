import { IDomainEventBus } from "../../../../core/interfaces/IDomainEventBus.js";
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js";
import { CategoryNotFoundException } from "../../../../domain/product_management/exceptions/CategoryNotFoundException.js";
import { ProductNotFoundException } from "../../../../domain/product_management/exceptions/ProductNotFoundException.js";
import { CategoryManager } from "../../../../domain/product_management/services/CategoryManager.js";

type AddProductInCategoryInput = {
  categoryId: string;
  productId: string;
};

export class AddProductInCategoryUsecase {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly eventBus: IDomainEventBus
  ) {}
  async call(input: AddProductInCategoryInput) {
    const categoryRepo = this.uow.getCategoryRepository();
    const productRepo = this.uow.getProductRepository();
    const category = await categoryRepo.findById(input.categoryId);
    if (!category) {
      throw new CategoryNotFoundException();
    }
    const product = await productRepo.findById(input.productId);
    if (!product) {
      throw new ProductNotFoundException();
    }

    await this.uow.save(category);
    await this.eventBus.dispatch(category, this.uow);
  }
}
