import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js";
import { Usecase } from "../../../../core/interfaces/Usecase.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { UpdateProductFields } from "../../../../domain/product_management/entities/product/Product.js";
import { ProductName } from "../../../../domain/product_management/entities/product/value_objects/ProductName.js";
import {
  ProductClassification,
  ProductSetting,
  SafetyStockCalculationMethod,
} from "../../../../domain/product_management/entities/product/value_objects/ProductSetting.js";
import { ProductNotFoundException } from "../../../../domain/product_management/exceptions/ProductNotFoundException.js";
import { ProductService } from "../../../../domain/product_management/services/ProductService.js";

export type UpdateProductInput = {
  fields: UpdateProductFields;
  productId: EntityId;
};

export class UpdateProductUsecase implements Usecase<any, any> {
  constructor(private readonly uow: IUnitOfWork) {}
  async call(input: UpdateProductInput) {
    const productRepo = this.uow.getProductRepository();
    const product = await productRepo.findById(input.productId);
    if (!product) {
      throw new ProductNotFoundException();
    }
    const productService = new ProductService();
    await productService.updateProduct(productRepo, product, input.fields);
    await this.uow.save(product);
  }
}
