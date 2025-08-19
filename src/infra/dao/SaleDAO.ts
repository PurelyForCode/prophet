import { Knex } from "knex";
import { EntityId } from "../../core/types/EntityId.js";

export type SaleFilterParams = Partial<{
  productId: EntityId;
  archived: boolean;
}>;

export type SaleDTO = {
  id: string;
  account_id: string;
  product_id: string;
  quantity: number;
  status: string;
  date: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};
export type SaleQueryDTO = {
  id: string;
  account_id: string;
  product_id: string;
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

  async findById(id: EntityId): Promise<SaleDTO | null> {
    const row = await this.knex<SaleDatabaseTable>(this.tableName)
      .select()
      .where("id", "=", id)
      .first();
    if (row) {
      return row;
    } else {
      return null;
    }
  }

  async queryById(
    id: EntityId,
    filters: SaleFilterParams | undefined
  ): Promise<SaleQueryDTO | null> {
    const builder = this.knex<SaleDatabaseTable>(`${this.tableName} as s`)
      .select("s.*")
      .where("s.id", "=", id)
      .first();

    if (filters) {
      if (filters.productId) {
        builder.where("s.product_id", "=", filters.productId);
      }
      if (filters.archived) {
        builder.whereNotNull("s.deleted_at");
      } else {
        builder.whereNull("s.deleted_at");
      }
    } else {
      builder.whereNull("s.deleted_at");
    }
    const row = await builder;
    if (row) {
      return this.mapToQueryDTO(row);
    } else {
      return null;
    }
  }

  async query(filters: SaleFilterParams | undefined): Promise<SaleQueryDTO[]> {
    const builder = this.knex<SaleDatabaseTable>(
      `${this.tableName} as s`
    ).select("s.*");
    if (filters) {
      if (filters.productId) {
        builder.where("s.product_id", "=", filters.productId);
      }
      if (filters.archived) {
        builder.whereNotNull("s.deleted_at");
      } else {
        builder.whereNull("s.deleted_at");
      }
    }
    const rows = await builder;
    return rows;
  }

  mapToQueryDTO(row: SaleDatabaseTable): SaleQueryDTO {
    return row;
  }
}
