import { Knex } from "knex";
import { EntityId } from "../../core/types/EntityId.js";
import { JoinedProductSettingTableColumns } from "./ProductSettingDAO.js";
import {
  ProductSettingDTO,
  ProductSettingQueryDTO,
} from "./ProductSettingDAO.js";
import { SaleDAO, SaleQueryDTO } from "./SaleDAO.js";

export type VariantQueryDTO = {
  id: string;
  accountId: string;
  productId: string;
  productCategoryId: string | null;
  name: string;
  stock: number;
  safetyStock: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  setting: ProductSettingQueryDTO | undefined;
  sales: SaleQueryDTO[] | undefined;
};

export type VariantDTO = {
  id: string;
  accountId: string;
  productId: string;
  productCategoryId: string | null;
  name: string;
  stock: number;
  safetyStock: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  setting: ProductSettingDTO;
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
      archived: boolean;
    }>
  | undefined;

type VariantDatabaseTable = {
  id: string;
  account_id: string;
  product_id: string;
  product_category_id: string | null;
  name: string;
  stock: number;
  safety_stock: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export class VariantDAO {
  private tableName = "product";
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
    const builder = this.knex<
      VariantDatabaseTable & JoinedProductSettingTableColumns
    >(`${this.tableName} as v`)
      .select("v.*")
      .where("v.id", id)
      .first();
    this.joinSettings(builder);
    const row = await builder;
    if (row) {
      return this.mapToDTO(row);
    } else {
      return null;
    }
  }

  async findByName(name: string) {
    const builder = this.knex<
      VariantDatabaseTable & JoinedProductSettingTableColumns
    >(`${this.tableName} as v`)
      .select("v.*")
      .where("v.name", name)
      .first();
    this.joinSettings(builder);
    const row = await builder;
    if (row) {
      return this.mapToDTO(row);
    } else {
      return null;
    }
  }

  async findAllByProductId(productId: EntityId): Promise<VariantDTO[]> {
    const builder = this.knex(`${this.tableName} as v`)
      .select("v.*")
      .where("v.product_id", "=", productId);
    this.joinSettings(builder);
    const rows = await builder;
    return rows.map((row) => {
      return this.mapToDTO(row);
    });
  }

  async queryOneFromProduct(
    variantId: EntityId,
    productId: EntityId,
    include: VariantIncludeParams
  ) {
    const builder = this.knex(`${this.tableName} as v`)
      .select("v.*")
      .where("v.id", "=", variantId)
      .and.where("v.product_id", "=", productId)
      .first();
    let sales: undefined | SaleQueryDTO[] = undefined;
    let setting: undefined | ProductSettingQueryDTO = undefined;

    if (include && typeof include !== "boolean") {
      if (include.setting) {
        this.joinSettings(builder);
      }
      if (include.sales) {
        sales = await new SaleDAO(this.knex).query({
          productId: variantId,
        });
      }
    }
    const row = (await builder) as VariantDatabaseTable &
      JoinedProductSettingTableColumns;

    if (include && typeof include !== "boolean") {
      if (include.setting) {
        setting = {
          classification: row.setting_classification,
          fillRate: row.setting_fill_rate,
          safetyStockCalculationMethod:
            row.setting_safety_stock_calculation_method,
          serviceLevel: row.setting_service_level,
          updatedAt: row.setting_updated_at,
        };
      }
    }

    return this.mapToQueryDTO(row, setting, sales);
  }

  async query(
    filters: VariantFiltersParams,
    include: VariantIncludeParams
  ): Promise<VariantQueryDTO[]> {
    const builder = this.knex(`${this.tableName} as v`).select("v.*");

    if (include && typeof include !== "boolean") {
      if (include.setting) {
        this.joinSettings(builder);
      }
    }

    let variants: VariantQueryDTO[] = [];
    const rows = (await builder) as (VariantDatabaseTable &
      JoinedProductSettingTableColumns)[];
    for (const variant of rows) {
      let setting: ProductSettingQueryDTO | undefined;
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
          sales = await new SaleDAO(this.knex).query({ productId: variant.id });
        }
      }

      const dto = this.mapToQueryDTO(variant, setting, sales);
      variants.push(dto);
    }

    return variants;
  }

  filter(builder: Knex, filters: VariantFiltersParams) {
    if (filters) {
      if (filters.productId) {
        builder.where("v.product_id", "=", filters.productId);
      }

      if (filters.name) {
        builder.where("v.name", "=", filters.name);
      }

      if (filters.archived) {
        builder.whereNotNull("v.deleted_at");
      } else {
        builder.whereNull("v.deleted_at");
      }
    }
  }

  mapToQueryDTO(
    variant: VariantDatabaseTable & JoinedProductSettingTableColumns,
    setting: ProductSettingQueryDTO | undefined,
    sales: any | undefined
  ): VariantQueryDTO {
    return {
      productCategoryId: variant.product_category_id,
      accountId: variant.account_id,
      productId: variant.product_id,
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
  mapToDTO(
    row: VariantDatabaseTable & JoinedProductSettingTableColumns
  ): VariantDTO {
    return {
      productCategoryId: row.product_category_id,
      accountId: row.account_id,
      productId: row.product_id,
      createdAt: row.created_at,
      deletedAt: row.deleted_at,
      id: row.id,
      name: row.name,
      safetyStock: row.safety_stock,
      setting: {
        classification: row.setting_classification,
        fillRate: row.setting_fill_rate,
        safetyStockCalculationMethod:
          row.setting_safety_stock_calculation_method,
        serviceLevel: row.setting_service_level,
        updatedAt: row.setting_updated_at,
      },
      stock: row.stock,
      updatedAt: row.updated_at,
    };
  }

  joinSettings(builder: Knex.QueryBuilder) {
    builder
      .join("product_setting as s", "v.id", "=", "s.product_id")
      .select(
        "s.classification as setting_classification",
        "s.safety_stock_calculation_method as setting_safety_stock_calculation_method",
        "s.service_level as setting_service_level",
        "s.fill_rate as setting_fill_rate",
        "s.updated_at as setting_updated_at"
      );
  }
}
