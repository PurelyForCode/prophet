import { Knex } from "knex";
import { EntityId } from "../../core/types/EntityId.js";

export type ProductSettingQueryDTO = {
  classification: string;
  safetyStockCalculationMethod: string;
  serviceLevel: number;
  fillRate: number;
  updatedAt: Date;
};

export type ProductSettingDTO = {
  classification: string;
  safetyStockCalculationMethod: string;
  serviceLevel: number;
  fillRate: number;
  updatedAt: Date;
};

export type ProductSettingDatabaseTable = {
  id: string;
  product_id: string;
  classification: string;
  fill_rate: number;
  service_level: number;
  safety_stock_calculation_method: string;
  updated_at: Date;
};

export class ProductSettingDAO {
  private tableName = "product_setting";
  constructor(private readonly knex: Knex.Transaction | Knex) {}

  async insert(input: ProductSettingDatabaseTable) {
    await this.knex<ProductSettingDatabaseTable>(this.tableName).insert(input);
  }

  // NOTE: Product setting has  a tricky update because it doesnt rely on the primary key id of the database
  // Instead, use the combination of productId and variantId
  async update(input: Omit<ProductSettingDatabaseTable, "id">) {
    await this.knex<ProductSettingDatabaseTable>(this.tableName)
      .update(input)
      .where({ product_id: input.product_id });
  }

  async delete(id: EntityId) {
    throw new Error("Deleting a product setting invalidates a technical rule");
  }

  async getProductSetting(
    productId: string
  ): Promise<ProductSettingDatabaseTable | null> {
    const rows = await this.knex<ProductSettingDatabaseTable>(this.tableName)
      .select()
      .where({ product_id: productId });
    if (rows.length > 1) {
      throw new Error(
        `Duplicate settings in settings table for product with id: ${productId}`
      );
    }
    if (rows[0]) {
      return rows[0];
    } else {
      return null;
    }
  }
}
export type JoinedProductSettingTableColumns = {
  setting_classification: string;
  setting_safety_stock_calculation_method: string;
  setting_service_level: number;
  setting_fill_rate: number;
  setting_updated_at: Date;
};
