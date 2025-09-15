import { IIdGenerator } from "../../../../core/interfaces/IIdGenerator.js";
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js";
import { ProductName } from "../../../../domain/product_management/entities/product/value_objects/ProductName.js";
import { ProductStock } from "../../../../domain/product_management/entities/product/value_objects/ProductStock.js";
import { ProductNotFoundException } from "../../../../domain/product_management/exceptions/ProductNotFoundException.js";

export type CreateVariantInput = {
  accountId: string;
  productId: string;
  name: string;
  stock: number | undefined;
};
export class CreateVariantUsecase {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly idGenerator: IIdGenerator
  ) {}
  async call(input: CreateVariantInput) {
    const productRepo = this.uow.getProductRepository();
    const product = await productRepo.findById(input.productId);
    if (!product) {
      throw new ProductNotFoundException();
    }
    const name = new ProductName(input.name);
    let stock: ProductStock;
    if (input.stock === undefined || input.stock === null) {
      stock = new ProductStock(0);
    } else {
      stock = new ProductStock(input.stock);
    }

    product.addVariant(
      this.idGenerator.generate(),
      input.accountId,
      name,
      stock
    );
    await this.uow.save(product);
  }
}
