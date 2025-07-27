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
import { Entity } from "../../core/interfaces/Entity.js";

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
      account_id: entity.accountId,
      created_at: entity.createdAt,
      deleted_at: entity.deletedAt,
      id: entity.id,
      name: entity.name.value,
      product_id: entity.productId,
      safety_stock: entity.safetyStock.value,
      stock: entity.stock.value,
      updated_at: entity.updatedAt,
    });
    const variantSetting = entity.settings;
    await this.settingDAO.update({
      classification: variantSetting.classification,
      fill_rate: variantSetting.fillRate,
      safety_stock_calculation_method:
        variantSetting.safetyStockCalculationMethod,
      service_level: variantSetting.serviceLevel,
      updated_at: variantSetting.updatedAt,
      product_id: entity.productId,
      variant_id: entity.id,
    });
  }
  async create(entity: Variant): Promise<void> {
    await this.variantDAO.insert({
      account_id: entity.accountId,
      created_at: entity.createdAt,
      deleted_at: entity.deletedAt,
      id: entity.id,
      name: entity.name.value,
      product_id: entity.productId,
      safety_stock: entity.safetyStock.value,
      stock: entity.stock.value,
      updated_at: entity.updatedAt,
    });
    const variantSetting = entity.settings;
    await this.settingDAO.insert({
      classification: variantSetting.classification,
      fill_rate: variantSetting.fillRate,
      safety_stock_calculation_method:
        variantSetting.safetyStockCalculationMethod,
      service_level: variantSetting.serviceLevel,
      updated_at: variantSetting.updatedAt,
      id: idGenerator.generate(),
      product_id: entity.productId,
      variant_id: entity.id,
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
    return Variant.create(
      row.id,
      row.productId,
      row.accountId,
      name,
      stock,
      safetyStock,
      setting,
      row.createdAt,
      row.updatedAt,
      row.deletedAt
    );
  }
}
