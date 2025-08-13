import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js";
import { Usecase } from "../../../../core/interfaces/Usecase.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { ProductName } from "../../../../domain/product_management/entities/product/value_objects/ProductName.js";
import {
  ProductClassification,
  ProductSetting,
  SafetyStockCalculationMethod,
} from "../../../../domain/product_management/entities/product/value_objects/ProductSetting.js";
import { ProductStock } from "../../../../domain/product_management/entities/product/value_objects/ProductStock.js";
import { SafetyStock } from "../../../../domain/product_management/entities/product/value_objects/SafetyStock.js";
import { ProductNotFoundException } from "../../../../domain/product_management/exceptions/ProductNotFoundException.js";
import { ProductManager } from "../../../../domain/product_management/services/ProductManager.js";

export type UpdateProductInput = {
  fields: Partial<{
    name: string;
    safetyStock: number;
    stock: number;
    settings: Partial<{
      serviceLevel: number;
      classification: ProductClassification;
      fillRate: number;
      safetyStockCalculationMethod: SafetyStockCalculationMethod;
    }>;
  }>;
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
    const productService = new ProductManager();
    const now = new Date();
    const name = input.fields.name
      ? new ProductName(input.fields.name)
      : undefined;
    const safetyStock = input.fields.safetyStock
      ? new SafetyStock(input.fields.safetyStock)
      : undefined;
    const stock = input.fields.stock
      ? new ProductStock(input.fields.stock)
      : undefined;

    let setting = undefined;
    if (input.fields.settings) {
      const currentSetting = product.settings;
      setting = new ProductSetting(
        input.fields.settings.serviceLevel ?? currentSetting.serviceLevel,
        input.fields.settings.safetyStockCalculationMethod ??
          currentSetting.safetyStockCalculationMethod,
        input.fields.settings.classification ?? currentSetting.classification,
        input.fields.settings.fillRate ?? currentSetting.fillRate,
        now
      );
    }

    await productService.updateProduct(productRepo, product, now, {
      name: name,
      safetyStock: safetyStock,
      settings: setting,
      stock: stock,
    });
    await this.uow.save(product);
  }
}
