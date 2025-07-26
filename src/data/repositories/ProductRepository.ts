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
import { ProductDAO, ProductTable } from "../dao/ProductDAO.js";
import { VariantDAO, VariantTable } from "../dao/VariantDAO.js";
import { ProductSettingDAO } from "../dao/ProductSettingDAO.js";

export class ProductRepository implements IProductRepository {
  private productDAO: ProductDAO;
  private variantDAO: VariantDAO;
  private settingDAO: ProductSettingDAO;
  constructor(knex: Knex.Transaction | Knex) {
    this.productDAO = new ProductDAO(knex);
    this.variantDAO = new VariantDAO(knex);
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
    const variants = await this.variantDAO.findAllByProductId(product.id);
    return this.mapToEntity(product, variants);
  }

  async findByName(name: ProductName): Promise<Product | null> {
    const product = await this.productDAO.findOneByName(name.value);
    if (!product) {
      return null;
    }
    const variants = await this.variantDAO.findAllByProductId(product.id);
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

  mapToEntity(table: ProductTable, variantRows: VariantTable[]): Product {
    const variants = new Map();
    variantRows.map((variant) => {
      const variantName = new ProductName(variant.name);
      const variantStock = new ProductStock(variant.stock);
      const variantSafetyStock = new SafetyStock(variant.safety_stock);
      const variantSetting = new ProductSetting(
        variant.setting_service_level,
        variant.setting_safety_stock_calculation_method as SafetyStockCalculationMethod,
        variant.setting_classification as ProductClassification,
        variant.setting_fill_rate,
        variant.setting_updated_at
      );
      const variantInstance = Variant.create(
        variant.id,
        variant.product_id,
        variant.account_id,
        variantName,
        variantStock,
        variantSafetyStock,
        variantSetting,
        variant.created_at,
        variant.updated_at,
        variant.deleted_at
      );
      variants.set(variantInstance.id, variantInstance);
    });

    return Product.create(
      table.id,
      table.account_id,
      table.product_category_id,
      new ProductName(table.name),
      new ProductStock(table.stock),
      new SafetyStock(table.safety_stock),
      new ProductSetting(
        table.setting_service_level,
        table.setting_safety_stock_calculation_method as SafetyStockCalculationMethod,
        table.setting_classification as ProductClassification,
        table.setting_fill_rate,
        table.setting_updated_at
      ),
      table.created_at,
      table.updated_at,
      table.deleted_at,
      variants
    );
  }
}
