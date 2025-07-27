import { Knex } from "knex";
import { EntityId } from "../../core/types/EntityId.js";
import { IProductRepository } from "../../domain/product_management/repositories/IProductRepository.js";
import { Product } from "../../domain/product_management/entities/product/Product.js";
import { ProductName } from "../../domain/product_management/entities/product/value_objects/ProductName.js";
import {
  ProductClassification,
  ProductSetting,
  SafetyStockCalculationMethod,
} from "../../domain/product_management/entities/product/value_objects/ProductSetting.js";
import { ProductStock } from "../../domain/product_management/entities/product/value_objects/ProductStock.js";
import { SafetyStock } from "../../domain/product_management/entities/product/value_objects/SafetyStock.js";
import { Variant } from "../../domain/product_management/entities/variant/Variant.js";
import { idGenerator } from "../utils/IdGenerator.js";
import { ProductDAO, ProductDTO, ProductTable } from "../dao/ProductDAO.js";
import { ProductSettingDAO } from "../dao/ProductSettingDAO.js";
import { VariantRepository } from "./VariantRepository.js";

export class ProductRepository implements IProductRepository {
  private productDAO: ProductDAO;
  private variantRepo: VariantRepository;
  private settingDAO: ProductSettingDAO;
  constructor(knex: Knex.Transaction | Knex) {
    this.productDAO = new ProductDAO(knex);
    this.variantRepo = new VariantRepository(knex);
    this.settingDAO = new ProductSettingDAO(knex);
  }

  async isProductNameUnique(name: ProductName): Promise<boolean> {
    return !(await this.productDAO.existsByName(name.value));
  }

  async findById(id: EntityId): Promise<Product | null> {
    const product = await this.productDAO.findOneById(id);
    if (!product) {
      return null;
    }
    const variants = await this.variantRepo.findAllByProductId(product.id);
    return this.mapToEntity(product, variants);
  }

  async findByName(name: ProductName): Promise<Product | null> {
    const product = await this.productDAO.findOneByName(name.value);
    if (!product) {
      return null;
    }
    const variants = await this.variantRepo.findAllByProductId(product.id);
    return this.mapToEntity(product, variants);
  }

  async delete(entity: Product) {
    await this.productDAO.delete(entity.id);
  }

  async update(entity: Product) {
    await this.productDAO.update({
      id: entity.id,
      account_id: entity.accountId,
      name: entity.name.value,
      product_category_id: entity.productCategoryId,
      safety_stock: entity.safetyStock.value,
      stock: entity.stock.value,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
      deleted_at: entity.deletedAt,
    });

    const productSetting = entity.settings;
    await this.settingDAO.update({
      classification: productSetting.classification,
      fill_rate: productSetting.fillRate,
      product_id: entity.id,
      safety_stock_calculation_method:
        productSetting.safetyStockCalculationMethod,
      service_level: productSetting.serviceLevel,
      updated_at: productSetting.updatedAt,
      variant_id: null,
    });
  }

  async create(entity: Product) {
    await this.productDAO.insert({
      id: entity.id,
      account_id: entity.accountId,
      name: entity.name.value,
      product_category_id: entity.productCategoryId,
      safety_stock: entity.safetyStock.value,
      stock: entity.stock.value,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
      deleted_at: entity.deletedAt,
    });
    const productSetting = entity.settings;
    await this.settingDAO.insert({
      id: idGenerator.generate(),
      classification: productSetting.classification,
      fill_rate: productSetting.fillRate,
      product_id: entity.id,
      service_level: productSetting.serviceLevel,
      safety_stock_calculation_method:
        productSetting.safetyStockCalculationMethod,
      updated_at: productSetting.updatedAt,
      variant_id: null,
    });
  }

  mapToEntity(product: ProductDTO, variants: Map<EntityId, Variant>): Product {
    return Product.create(
      product.id,
      product.accountId,
      product.productCategoryId,
      new ProductName(product.name),
      new ProductStock(product.stock),
      new SafetyStock(product.safetyStock),
      new ProductSetting(
        product.setting.serviceLevel,
        product.setting.safetyStockCalculationMethod,
        product.setting.classification,
        product.setting.fillRate,
        product.setting.updatedAt
      ),
      product.createdAt,
      product.updatedAt,
      product.deletedAt,
      variants
    );
  }
}
