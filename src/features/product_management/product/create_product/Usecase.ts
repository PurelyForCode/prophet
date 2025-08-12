import { IDomainEventBus } from "../../../../core/interfaces/IDomainEventBus.js";
import { IIdGenerator } from "../../../../core/interfaces/IIdGenerator.js";
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js";
import { Usecase } from "../../../../core/interfaces/Usecase.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { ProductName } from "../../../../domain/product_management/entities/product/value_objects/ProductName.js";
import {
  ProductClassification,
  ProductSetting,
  SafetyStockCalculationMethod,
} from "../../../../domain/product_management/entities/product/value_objects/ProductSetting.js";
import { ProductService } from "../../../../domain/product_management/services/ProductService.js";

export type CreateProductInput = {
  accountId: EntityId;
  productCategoryId: EntityId | null;
  name: string;
  settings?: {
    serviceLevel: number;
    safetyStockCalculationMethod: SafetyStockCalculationMethod;
    classification: ProductClassification;
    fillRate: number;
  };
};

export class CreateProductUsecase implements Usecase<any, any> {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly eventBus: IDomainEventBus,
    private readonly idGenerator: IIdGenerator
  ) {}
  async call(input: CreateProductInput) {
    const productRepo = this.uow.getProductRepository();

    const productName = new ProductName(input.name);
    const now = new Date();
    let productSettings: ProductSetting;
    if (input.settings) {
      productSettings = new ProductSetting(
        input.settings.serviceLevel,
        input.settings.safetyStockCalculationMethod,
        input.settings.classification,
        input.settings.fillRate,
        now
      );
    } else {
      productSettings = ProductSetting.defaultConfiguration(now);
    }

    const productService = new ProductService();
    const product = await productService.createProduct(productRepo, {
      id: this.idGenerator.generate(),
      accountId: input.accountId,
      productCategoryId: input.productCategoryId,
      name: productName,
      settings: productSettings,
      now: now,
    });

    await this.eventBus.dispatch(product, this.uow);
    await this.uow.save(product);
  }
}
