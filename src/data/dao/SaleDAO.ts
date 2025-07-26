import { Knex } from "knex";
import { EntityId } from "../../core/types/EntityId.js";

export type SaleFilterParams =
  | Partial<{
      productId: EntityId;
      variantId: EntityId | null;
      archived: true | undefined;
    }>
  | undefined;
export type SaleDTO = {
  id: string;
  account_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  status: string;
  date: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type SaleDatabaseTable = {
  id: string;
  account_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  status: string;
  date: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export class SaleDAO {
  private tableName = "sale";
  constructor(private readonly knex: Knex) {}
  async delete(id: EntityId) {
    await this.knex<SaleDatabaseTable>(this.tableName)
      .delete()
      .where({ id: id });
  }

  async insert(input: SaleDatabaseTable) {
    await this.knex<SaleDatabaseTable>(this.tableName).insert(input);
  }

  async update(input: SaleDatabaseTable) {
    await this.knex<SaleDatabaseTable>(this.tableName)
      .update(input)
      .where({ id: input.id });
  }

  async query(filters: SaleFilterParams): Promise<SaleDTO[]> {
    const builder = this.knex<SaleDatabaseTable>(
      `${this.tableName} as s`
    ).select("s.*");
    if (filters) {
      if (filters.productId) {
        builder.where("s.product_id", "=", filters.productId);
      }
      if (filters.variantId !== undefined) {
        if (filters.variantId === null) {
          builder.whereNull("s.variant_id");
        } else {
          builder.where("s.variant_id", "=", filters.variantId);
        }
      }
    }
    const rows = await builder;
    return rows;
  }
}
