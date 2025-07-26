import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js";
import { Usecase } from "../../../../core/interfaces/Usecase.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { ProductNotFoundException } from "../../../../domain/product_management/exceptions/ProductNotFoundException.js";
import { ProductService } from "../../../../domain/product_management/services/ProductService.js";

export type ArchiveProductInput = { productId: EntityId };

export class ArchiveProductUsecase implements Usecase<any, any> {
  constructor(private readonly uow: IUnitOfWork) {}
  async call(input: ArchiveProductInput) {
    const productRepo = this.uow.getProductRepository();
    const product = await productRepo.findById(input.productId);
    if (!product) {
      throw new ProductNotFoundException();
    }
    const productService = new ProductService();
    productService.archiveProduct(product);
    await this.uow.save(product);
  }
}
