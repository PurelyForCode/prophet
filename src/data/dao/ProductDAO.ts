import { Knex } from "knex";
import { EntityId } from "../../core/types/EntityId.js";
import { JoinedProductSettingTableColumns } from "../common/JoinedProductSettingTableColumns.js";
import { VariantDAO, VariantDTO, VariantIncludeParams } from "./VariantDAO.js";
import { ProductSettingDTO } from "./ProductSettingDAO.js";
import { SaleDAO, SaleDTO } from "./SaleDAO.js";

export type ProductDTO = {
  id: string;
  accountId: string;
  productCategoryId: string | null;
  name: string;
  stock: number;
  safetyStock: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  setting: ProductSettingDTO | undefined;
  variants: VariantDTO[] | undefined;
  sales: any;
};

export type ProductIncludeParams =
  | Partial<{
      sales: boolean;
      variants: VariantIncludeParams;
      setting: boolean;
    }>
  | undefined;

export type ProductFiltersParams =
  | Partial<{
      name: string;
      id: EntityId;
      archived: true | undefined;
    }>
  | undefined;

export type ProductDatabaseTable = {
  id: string;
  account_id: string;
  product_category_id: string | null;
  name: string;
  stock: number;
  safety_stock: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type ProductTable = ProductDatabaseTable &
  JoinedProductSettingTableColumns;

export class ProductDAO {
  private tableName = "product";
  constructor(private readonly knex: Knex) {}

  async insert(input: ProductDatabaseTable) {
    await this.knex<ProductDatabaseTable>(this.tableName).insert(input);
  }

  async update(input: ProductDatabaseTable) {
    await this.knex<ProductDatabaseTable>(this.tableName)
      .update(input)
      .where({ id: input.id });
  }

  async delete(id: EntityId) {
    await this.knex<ProductTable>(this.tableName).delete().where({ id });
  }

  async existsByName(name: string) {
    const row = await this.knex("product")
      .select(
        this.knex.raw("exists (select 1 from product where name = ?)", [name])
      )
      .first();

    return row.exists;
  }

  async findOneById(id: EntityId): Promise<ProductTable | null> {
    const rows = await this.knex(`${this.tableName} as p`)
      .select("p.*")
      .join("product_setting as s", "p.id", "=", "s.product_id")
      .select(
        "s.classification as setting_classification",
        "s.safety_stock_calculation_method as setting_safety_stock_calculation_method",
        "s.service_level as setting_service_level",
        "s.fill_rate as setting_fill_rate",
        "s.updated_at as setting_updated_at"
      )
      .where("p.id", id)
      .whereNull("s.variant_id");
    if (rows[0]) {
      return rows[0];
    } else {
      return null;
    }
  }

  async findOneByName(name: string) {
    const rows = await this.knex(`${this.tableName} as p`)
      .select("p.*")
      .join("product_setting as s", "p.id", "=", "s.product_id")
      .select(
        "s.classification as setting_classification",
        "s.safety_stock_calculation_method as setting_safety_stock_calculation_method",
        "s.service_level as setting_service_level",
        "s.fill_rate as setting_fill_rate",
        "s.updated_at as setting_updated_at"
      )
      .where("p.name", name)
      .whereNull("s.variant_id");
    if (rows[0]) {
      return rows[0];
    } else {
      return null;
    }
  }
  async findAll(): Promise<ProductTable[]> {
    const rows = await this.knex<ProductTable>(this.tableName).select();
    return rows;
  }

  async queryOne(id: EntityId, include: ProductIncludeParams) {
    let variants: VariantDTO[] | undefined = undefined;
    let sales: any[] | undefined = undefined;
    let setting: ProductSettingDTO | undefined = undefined;
    const builder = this.knex<ProductDatabaseTable>(
      `${this.tableName} as p`
    ).select("p.*");

    const included = await this.include(id, include, undefined);
    variants = included.variants;
    sales = included.sales;
    if (include) {
      if (include.setting) {
        this.joinSettings(builder);
      }
    }

    const rows = (await builder) as ProductTable[];
    if (!rows[0]) {
      return null;
    }
    const row = rows[0];
    if (include && include.setting) {
      setting = {
        classification: row.setting_classification,
        fillRate: row.setting_fill_rate,
        safetyStockCalculationMethod:
          row.setting_safety_stock_calculation_method,
        serviceLevel: row.setting_service_level,
        updatedAt: row.setting_updated_at,
      };
    }

    return this.mapToDTO(row, variants, setting, sales);
  }

  async query(filters: ProductFiltersParams, include: ProductIncludeParams) {
    const builder = this.knex<ProductTable>(`${this.tableName} as p`);
    this.filter(builder, filters);
    if (include && include.setting) {
      this.joinSettings(builder);
    }
    const rows = await builder;
    const productDTOs = [];
    for (const row of rows) {
      let setting: ProductSettingDTO | undefined;
      if (include && include.setting) {
        setting = {
          classification: row.setting_classification,
          fillRate: row.setting_fill_rate,
          serviceLevel: row.setting_service_level,
          safetyStockCalculationMethod:
            row.setting_safety_stock_calculation_method,
          updatedAt: row.setting_updated_at,
        };
      }
      const included = await this.include(row.id, include, filters?.archived);
      productDTOs.push(
        this.mapToDTO(row, included.variants, setting, included.sales)
      );
    }
    return productDTOs;
  }

  mapToDTO(
    product: ProductDatabaseTable,
    variants: VariantDTO[] | undefined,
    setting: ProductSettingDTO | undefined,
    sales: any | undefined
  ): ProductDTO {
    return {
      id: product.id,
      accountId: product.account_id,
      productCategoryId: product.product_category_id,
      name: product.name,
      safetyStock: product.safety_stock,
      stock: product.stock,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      deletedAt: product.deleted_at,
      //TODO
      sales: sales,
      setting: setting,
      variants: variants,
    };
  }

  async filter(builder: Knex.QueryBuilder, filters: ProductFiltersParams) {
    if (filters) {
      if (filters.id) {
        builder.where("p.id", "=", filters.id);
      }
      if (filters.name) {
        builder.whereLike("p.name", `${filters.name}%`);
      }
      if (filters.archived) {
        builder.whereNotNull("p.deleted_at");
      }
    }
  }

  async include(
    productId: EntityId,
    include: ProductIncludeParams,
    archived: true | undefined
  ): Promise<{
    variants: VariantDTO[] | undefined;
    sales: any[] | undefined;
  }> {
    let variants: VariantDTO[] | undefined;
    let sales: SaleDTO[] | undefined;
    if (include) {
      if (include.variants) {
        if (typeof include.variants === "boolean") {
          variants = await new VariantDAO(this.knex).query(
            { productId: productId, archived: archived },
            false
          );
        } else {
          variants = await new VariantDAO(this.knex).query(
            { productId: productId, archived: archived },
            include.variants
          );
        }
      }
      if (include.sales) {
        sales = await new SaleDAO(this.knex).query({
          archived: archived,
          productId: productId,
          variantId: null,
        });
      }
    }

    return { variants, sales };
  }

  joinSettings(builder: Knex.QueryBuilder) {
    builder
      .join("product_setting as s", "p.id", "=", "s.product_id")
      .select(
        "s.classification as setting_classification",
        "s.safety_stock_calculation_method as setting_safety_stock_calculation_method",
        "s.service_level as setting_service_level",
        "s.fill_rate as setting_fill_rate",
        "s.updated_at as setting_updated_at"
      )
      .whereNull("s.variant_id");
  }
}
