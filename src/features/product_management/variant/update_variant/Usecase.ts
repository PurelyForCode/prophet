import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js";
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

export type UpdateVariantInput = {
  fields: Partial<{
    name: string;
    stock: number;
    safetyStock: number;
    settings: Partial<{
      serviceLevel: number;
      classification: ProductClassification;
      fillRate: number;
      safetyStockCalculationMethod: SafetyStockCalculationMethod;
    }>;
  }>;
  productId: EntityId;
  variantId: EntityId;
};

export class UpdateVariantUsecase {
  constructor(private readonly uow: IUnitOfWork) {}
  async call(input: UpdateVariantInput) {
    const productRepo = this.uow.getProductRepository();
    const product = await productRepo.findById(input.productId);
    if (!product) {
      throw new ProductNotFoundException();
    }

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

    let settings = undefined;
    if (input.fields.settings) {
      const currentSetting = product.settings;
      settings = new ProductSetting(
        input.fields.settings.serviceLevel ?? currentSetting.serviceLevel,
        input.fields.settings.safetyStockCalculationMethod ??
          currentSetting.safetyStockCalculationMethod,
        input.fields.settings.classification ?? currentSetting.classification,
        input.fields.settings.fillRate ?? currentSetting.fillRate,
        now
      );
    }

    product.updateVariant(input.variantId, {
      name: name,
      safetyStock: safetyStock,
      settings: settings,
      stock: stock,
    });
    await this.uow.save(product);
    return;
  }
}
