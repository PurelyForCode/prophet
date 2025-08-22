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

export class ProductManager {
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
    const isNameUnique = await productRepo.isProductNameUnique(input.name);
    if (!isNameUnique) {
      throw new DuplicateProductNameException();
    }
    const product = Product.create({
      id: input.id,
      accountId: input.accountId,
      productCategoryId: input.productCategoryId,
      name: input.name,
      stock: new ProductStock(0),
      safetyStock: new SafetyStock(0),
      settings:
        input.settings ?? ProductSetting.defaultConfiguration(input.now),
      createdAt: input.now,
      updatedAt: input.now,
      deletedAt: null,
      variants: new Map(),
    });
    product.addTrackedEntity(product, EntityAction.created);
    return product;
  }

  archiveProduct(product: Product) {
    if (product.getDeletedAt()) {
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
    updatedAt: Date,
    fields: UpdateProductFields
  ) {
    if (product.getDeletedAt()) {
      throw new ProductIsAlreadyArchived();
    }
    if (fields.name) {
      const isNameUnique = await productRepo.isProductNameUnique(fields.name);
      if (!isNameUnique) {
        throw new DuplicateProductNameException();
      }
      product.setName(fields.name);
    }
    fields.stock && product.setStock(fields.stock);
    fields.safetyStock && product.setSafetyStock(fields.safetyStock);
    fields.settings && product.updateSetting(fields.settings);
    product.setUpdatedAt(updatedAt);
    product.addTrackedEntity(product, EntityAction.updated);
  }

  async removeProductFromCategory(product: Product) {
    product.removeInCategory();
  }
}
