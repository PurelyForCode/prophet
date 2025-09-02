import { IEventBus } from "../../../../core/interfaces/IDomainEventBus.js";
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js";
import { CategoryNotFoundException } from "../../../../domain/product_management/exceptions/CategoryNotFoundException.js";
import { ProductNotFoundException } from "../../../../domain/product_management/exceptions/ProductNotFoundException.js";
import { ProductManager } from "../../../../domain/product_management/services/ProductManager.js";

type RemoveProductInCategoryInput = {
  categoryId: string;
  productId: string;
};

export class RemoveProductInCategoryUsecase {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly eventBus: IEventBus
  ) {}
  async call(input: RemoveProductInCategoryInput) {
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
    const productManager = new ProductManager();
    productManager.removeProductFromCategory(product);

    await this.uow.save(product);
    await this.eventBus.dispatch(product, this.uow);
    await this.uow.save(category);
    await this.eventBus.dispatch(category, this.uow);
  }
}
