import { Knex } from "knex";
import { Variant } from "../../domain/product_management/entities/variant/Variant.js";
import { IVariantRepository } from "../../domain/product_management/repositories/IVariantRepository.js";
import { idGenerator } from "../utils/IdGenerator.js";
import { ProductSettingDAO } from "../dao/ProductSettingDAO.js";
import { VariantDAO, VariantDTO } from "../dao/VariantDAO.js";
import { EntityId } from "../../core/types/EntityId.js";
import { ProductName } from "../../domain/product_management/entities/product/value_objects/ProductName.js";
import {
  ProductClassification,
  ProductSetting,
  SafetyStockCalculationMethod,
} from "../../domain/product_management/entities/product/value_objects/ProductSetting.js";
import { SafetyStock } from "../../domain/product_management/entities/product/value_objects/SafetyStock.js";
import { ProductStock } from "../../domain/product_management/entities/product/value_objects/ProductStock.js";

export class VariantRepository implements IVariantRepository {
  private variantDAO: VariantDAO;
  private settingDAO: ProductSettingDAO;
  constructor(knex: Knex) {
    this.variantDAO = new VariantDAO(knex);
    this.settingDAO = new ProductSettingDAO(knex);
  }

  async findById(id: EntityId): Promise<Variant | null> {
    const variantDTO = await this.variantDAO.findById(id);
    if (!variantDTO) {
      return null;
    } else {
      return this.mapToEntity(variantDTO);
    }
  }

  async findAllByProductId(
    productId: EntityId
  ): Promise<Map<EntityId, Variant>> {
    const variantDTOs = await this.variantDAO.findAllByProductId(productId);
    const variants = new Map<EntityId, Variant>();
    for (const variantDTO of variantDTOs) {
      const variant = this.mapToEntity(variantDTO);
      variants.set(variant.id, variant);
    }
    return variants;
  }

  async delete(entity: Variant): Promise<void> {
    await this.variantDAO.delete(entity.id);
  }

  async update(entity: Variant): Promise<void> {
    await this.variantDAO.update({
      account_id: entity.getAccountId(),
      product_category_id: entity.getProductCategoryId(),
      created_at: entity.getCreatedAt(),
      deleted_at: entity.getDeletedAt(),
      id: entity.id,
      name: entity.getName().value,
      product_id: entity.getProductId(),
      safety_stock: entity.getSafetyStock().value,
      stock: entity.getStock().value,
      updated_at: entity.getUpdatedAt(),
    });
    const variantSetting = entity.getSettings();
    await this.settingDAO.update({
      classification: variantSetting.classification,
      fill_rate: variantSetting.fillRate,
      safety_stock_calculation_method:
        variantSetting.safetyStockCalculationMethod,
      service_level: variantSetting.serviceLevel,
      updated_at: variantSetting.updatedAt,
      product_id: entity.id,
    });
  }

  async create(entity: Variant): Promise<void> {
    await this.variantDAO.insert({
      account_id: entity.getAccountId(),
      product_category_id: entity.getProductCategoryId(),
      created_at: entity.getCreatedAt(),
      deleted_at: entity.getDeletedAt(),
      id: entity.id,
      name: entity.getName().value,
      product_id: entity.getProductId(),
      safety_stock: entity.getSafetyStock().value,
      stock: entity.getStock().value,
      updated_at: entity.getUpdatedAt(),
    });
    const variantSetting = entity.getSettings();
    await this.settingDAO.insert({
      classification: variantSetting.classification,
      fill_rate: variantSetting.fillRate,
      safety_stock_calculation_method:
        variantSetting.safetyStockCalculationMethod,
      service_level: variantSetting.serviceLevel,
      updated_at: variantSetting.updatedAt,
      id: idGenerator.generate(),
      product_id: entity.id,
    });
  }

  mapToEntity(row: VariantDTO): Variant {
    const name = new ProductName(row.name);
    const stock = new ProductStock(row.stock);
    const safetyStock = new SafetyStock(row.safetyStock);
    const setting = new ProductSetting(
      row.setting.serviceLevel,
      row.setting.safetyStockCalculationMethod as SafetyStockCalculationMethod,
      row.setting.classification as ProductClassification,
      row.setting.fillRate,
      row.setting.updatedAt
    );
    return Variant.create({
      id: row.id,
      productId: row.productId,
      accountId: row.accountId,
      name: name,
      stock: stock,
      safetyStock: safetyStock,
      settings: setting,
      productCategoryId: row.productCategoryId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    });
  }
}
