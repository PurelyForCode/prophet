import { Knex } from "knex";
import { EntityId } from "../../core/types/EntityId.js";
import { JoinedProductSettingTableColumns } from "../common/JoinedProductSettingTableColumns.js";
import { ProductSettingDTO, ProductSettingTable } from "./ProductSettingDAO.js";
import { SaleDAO } from "./SaleDAO.js";

export type VariantDTO = {
  id: string;
  accountId: string;
  name: string;
  stock: number;
  safetyStock: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  setting: ProductSettingDTO | undefined;
  sales: any;
};

export type VariantIncludeParams =
  | Partial<{
      sales: boolean;
      setting: boolean;
    }>
  | undefined
  | boolean;

export type VariantFiltersParams =
  | Partial<{
      name: string;
      productId: EntityId;
      archived: true | undefined;
    }>
  | undefined;

type VariantDatabaseTable = {
  id: string;
  product_id: string;
  account_id: string;
  name: string;
  stock: number;
  safety_stock: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};
export type VariantTable = VariantDatabaseTable &
  JoinedProductSettingTableColumns;

export class VariantDAO {
  private tableName = "variant";
  constructor(private readonly knex: Knex.Transaction | Knex) {}

  async delete(id: EntityId) {
    await this.knex(this.tableName).delete().where({ id: id });
  }

  async update(input: VariantDatabaseTable) {
    await this.knex<VariantDatabaseTable>(this.tableName)
      .where({ id: input.id })
      .update(input);
  }

  async insert(input: VariantDatabaseTable) {
    await this.knex<VariantDatabaseTable>(this.tableName).insert(input);
  }

  async findById(id: EntityId) {
    const rows = await this.knex(`${this.tableName} as v`)
      .select("v.*")
      .where("v.id", id)
      .join("product_setting as s", "v.id", "=", "s.variant_id")
      .select(
        "s.classification as setting_classification",
        "s.safety_stock_calculation_method as setting_safety_stock_calculation_method",
        "s.service_level as setting_service_level",
        "s.fill_rate as setting_fill_rate",
        "s.updated_at as setting_updated_at"
      );
    if (rows[0]) {
      return rows[0];
    } else {
      return null;
    }
  }

  async findByName(name: string) {
    const rows = await this.knex(`${this.tableName} as v`)
      .select("v.*")
      .where("v.name", name)
      .join("product_setting as s", "v.id", "=", "s.variant_id")
      .select(
        "s.classification as setting_classification",
        "s.safety_stock_calculation_method as setting_safety_stock_calculation_method",
        "s.service_level as setting_service_level",
        "s.fill_rate as setting_fill_rate",
        "s.updated_at as setting_updated_at"
      );
    if (rows[0]) {
      return rows[0];
    } else {
      return null;
    }
  }

  async findAllByProductId(productId: EntityId) {
    const rows = await this.knex(`${this.tableName} as v`)
      .select("v.*")
      .join("product_setting as s", "v.id", "=", "s.variant_id")
      .select(
        "s.classification as setting_classification",
        "s.safety_stock_calculation_method as setting_safety_stock_calculation_method",
        "s.service_level as setting_service_level",
        "s.fill_rate as setting_fill_rate",
        "s.updated_at as setting_updated_at"
      )
      .where("v.product_id", "=", productId);
    return rows;
  }
  async queryOne(
    id: EntityId,
    include: VariantIncludeParams
  ): Promise<VariantDTO> {
    //TODO
    throw new Error();
  }

  async query(
    filters: VariantFiltersParams,
    include: VariantIncludeParams
  ): Promise<VariantDTO[]> {
    const builder = this.knex(`${this.tableName} as v`).select("v.*");

    if (filters && filters.archived) {
      builder.whereNotNull("v.deleted_at");
    } else {
      builder.whereNull("v.deleted_at");
    }

    if (filters) {
      if (filters.productId) {
        builder.where("v.product_id", "=", filters.productId);
      }
      if (filters.name) {
        builder.where("v.name", "=", filters.name);
      }
    }

    if (include && typeof include !== "boolean") {
      if (include.setting) {
        builder
          .join("product_setting as s", "v.id", "=", "s.variant_id")
          .select(
            "s.classification as setting_classification",
            "s.safety_stock_calculation_method as setting_safety_stock_calculation_method",
            "s.service_level as setting_service_level",
            "s.fill_rate as setting_fill_rate",
            "s.updated_at as setting_updated_at"
          );
      }
    }
    let variants: VariantDTO[] = [];
    const rows = (await builder) as VariantTable[];
    for (const variant of rows) {
      let setting: ProductSettingDTO | undefined;
      let sales: any[] | undefined;

      if (include && typeof include !== "boolean") {
        if (include.setting) {
          setting = {
            classification: variant.setting_classification,
            fillRate: variant.setting_fill_rate,
            safetyStockCalculationMethod:
              variant.setting_safety_stock_calculation_method,
            serviceLevel: variant.setting_service_level,
            updatedAt: variant.setting_updated_at,
          };
        }

        if (include.sales) {
          sales = await new SaleDAO(this.knex).query({
            productId: variant.product_id,
            variantId: variant.id,
          });
        }
      }

      const dto = this.mapToDTO(variant, setting, sales);
      variants.push(dto);
    }
    //  = rows.map(async (variant) => {
    //   let setting: ProductSettingDTO | undefined;
    //   let sales: any[] | undefined;
    //   if (include && typeof include !== "boolean") {
    //     if (include.setting) {
    //       setting = {
    //         classification: variant.setting_classification,
    //         fillRate: variant.setting_fill_rate,
    //         safetyStockCalculationMethod:
    //           variant.setting_safety_stock_calculation_method,
    //         serviceLevel: variant.setting_service_level,
    //         updatedAt: variant.setting_updated_at,
    //       };
    //     }
    //     if (include.sales) {
    //       sales = await new SaleDAO(this.knex).query({
    //         productId: variant.product_id,
    //         variantId: variant.id,
    //       });
    //     }
    //   }
    //   return this.mapToDTO(variant, setting, sales);
    // });
    return variants;
  }

  mapToDTO(
    variant: VariantTable,
    setting: ProductSettingDTO | undefined,
    sales: any | undefined
  ): VariantDTO {
    return {
      accountId: variant.account_id,
      createdAt: variant.created_at,
      deletedAt: variant.deleted_at,
      id: variant.id,
      name: variant.name,
      safetyStock: variant.safety_stock,
      stock: variant.stock,
      updatedAt: variant.updated_at,
      setting,
      sales,
    };
  }
}
