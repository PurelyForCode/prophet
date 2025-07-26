import { Knex } from "knex";
import { Variant } from "../../domain/product_management/entities/variant/Variant.js";
import { IVariantRepository } from "../../domain/product_management/repositories/IVariantRepository.js";
import { idGenerator } from "../utils/IdGenerator.js";
import { ProductSettingDAO } from "../dao/ProductSettingDAO.js";
import { VariantDAO } from "../dao/VariantDAO.js";

export class VariantRepository implements IVariantRepository {
  private variantDAO: VariantDAO;
  private settingDAO: ProductSettingDAO;
  constructor(knex: Knex) {
    this.variantDAO = new VariantDAO(knex);
    this.settingDAO = new ProductSettingDAO(knex);
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
}
