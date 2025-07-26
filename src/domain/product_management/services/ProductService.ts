import { EntityAction } from "../../../core/interfaces/AggregateRoot.js";
import { EntityId } from "../../../core/types/EntityId.js";
import { Product, UpdateProductFields } from "../entities/product/Product.js";
import { ProductName } from "../entities/product/value_objects/ProductName.js";
import { ProductSetting } from "../entities/product/value_objects/ProductSetting.js";
import { ProductStock } from "../entities/product/value_objects/ProductStock.js";
import { SafetyStock } from "../entities/product/value_objects/SafetyStock.js";
import { DuplicateProductNameException } from "../exceptions/DuplicateNameException.js";
import { ProductIsAlreadyArchived } from "../exceptions/ProductIsAlreadyArchived.js";
import { IProductRepository } from "../repositories/IProductRepository.js";

export class ProductService {
  async isNameUnique(
    productRepo: IProductRepository,
    name: ProductName
  ): Promise<boolean> {
    return await productRepo.isProductNameUnique(name);
  }

  async createProduct(
    productRepo: IProductRepository,
    input: {
      id: EntityId;
      accountId: EntityId;
      productCategoryId: EntityId | null;
      name: ProductName;
      settings: ProductSetting | undefined;
      now: Date;
    }
  ) {
    if (!(await this.isNameUnique(productRepo, input.name))) {
      throw new DuplicateProductNameException();
    }

    const product = Product.create(
      input.id,
      input.accountId,
      input.productCategoryId,
      input.name,
      new ProductStock(0),
      new SafetyStock(0),
      input.settings ?? ProductSetting.defaultConfiguration(input.now),
      input.now,
      input.now,
      null,
      new Map()
    );
    product.addTrackedEntity(product, EntityAction.created);
    return product;
  }

  archiveProduct(product: Product) {
    if (product.deletedAt) {
      throw new ProductIsAlreadyArchived();
    }
    product.archive();
  }

  deleteProduct(product: Product) {
    product.delete();
  }

  async updateProduct(
    productRepo: IProductRepository,
    product: Product,
    fields: UpdateProductFields
  ) {
    if (product.deletedAt) {
      throw new ProductIsAlreadyArchived();
    }
    const now = new Date();
    if (fields.name) {
      const name = new ProductName(fields.name);
      if (!(await this.isNameUnique(productRepo, name))) {
        throw new DuplicateProductNameException();
      }
      product.name = name;
    }
    fields.stock && (product.stock = new ProductStock(fields.stock));
    fields.safetyStock &&
      (product.safetyStock = new SafetyStock(fields.safetyStock));

    fields.settings && product.updateSetting(fields.settings);
    product.updatedAt = now;
  }
}
