import { Knex } from "knex";
import { EntityId } from "../../core/types/EntityId.js";
import {
  JoinedProductSettingTableColumns,
  ProductSettingDTO,
} from "./ProductSettingDAO.js";
import {
  VariantDAO,
  VariantQueryDTO,
  VariantIncludeParams,
} from "./VariantDAO.js";
import { ProductSettingQueryDTO } from "./ProductSettingDAO.js";
import { SaleDAO, SaleQueryDTO } from "./SaleDAO.js";

export type ProductQueryDTO = {
  id: string;
  accountId: string;
  productCategoryId: string | null;
  name: string;
  stock: number;
  safetyStock: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  setting: ProductSettingQueryDTO | undefined;
  variants: VariantQueryDTO[] | undefined;
  sales: any;
};

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
  setting: ProductSettingDTO;
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
    const builder = this.knex("product")
      .select(
        this.knex.raw("exists (select 1 from product where name = ?)", [name])
      )
      .first();
    const row = await builder;
    if (row) {
      return row.exists;
    } else {
      return false;
    }
  }

  async findOneById(id: EntityId): Promise<ProductDTO | null> {
    const builder = this.knex(`${this.tableName} as p`)
      .select("p.*")
      .where("p.id", id)
      .first();
    this.joinSettings(builder);
    const row = await builder;
    if (row) {
      return this.mapToDTO(row);
    } else {
      return null;
    }
  }

  async findOneByName(name: string): Promise<ProductDTO | null> {
    const builder = this.knex(`${this.tableName} as p`)
      .select("p.*")
      .where("p.name", name)
      .first();
    this.joinSettings(builder);
    const row = await builder;
    if (!row) {
      return null;
    } else {
      return this.mapToDTO(row);
    }
  }

  async findAll(): Promise<ProductDTO[]> {
    const builder = this.knex<ProductTable>(`${this.tableName} as p`).select();
    this.joinSettings(builder);
    const rows = await builder;
    return rows.map((row) => this.mapToDTO(row));
  }

  async queryOne(id: EntityId, include: ProductIncludeParams) {
    let variants: VariantQueryDTO[] | undefined = undefined;
    let sales: any[] | undefined = undefined;
    let setting: ProductSettingQueryDTO | undefined = undefined;
    const builder = this.knex<ProductDatabaseTable>(`${this.tableName} as p`)
      .select("p.*")
      .where("p.id", "=", id)
      .first();

    const included = await this.include(id, include, undefined);
    variants = included.variants;
    sales = included.sales;
    if (include) {
      if (include.setting) {
        this.joinSettings(builder);
      }
    }
    const row = (await builder) as ProductTable;
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

    return this.mapToQueryDTO(row, variants, setting, sales);
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
      let setting: ProductSettingQueryDTO | undefined;
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
        this.mapToQueryDTO(row, included.variants, setting, included.sales)
      );
    }
    return productDTOs;
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
    variants: VariantQueryDTO[] | undefined;
    sales: any[] | undefined;
  }> {
    let variants: VariantQueryDTO[] | undefined;
    let sales: SaleQueryDTO[] | undefined;
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

  mapToQueryDTO(
    product: ProductDatabaseTable,
    variants: VariantQueryDTO[] | undefined,
    setting: ProductSettingQueryDTO | undefined,
    sales: any | undefined
  ): ProductQueryDTO {
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
  mapToDTO(row: ProductTable & JoinedProductSettingTableColumns): ProductDTO {
    return {
      accountId: row.account_id,
      createdAt: row.created_at,
      deletedAt: row.deleted_at,
      id: row.id,
      name: row.name,
      productCategoryId: row.product_category_id,
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
}
