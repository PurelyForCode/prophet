import { Knex } from "knex";
import { EntityId } from "../../core/types/EntityId.js";
import {
  SuppliedProductDAO,
  SuppliedProductQueryDTO,
} from "./SuppliedProductDAO.js";
import { SupplierName } from "../../domain/delivery_management/entities/supplier/value_objects/SupplierName.js";

export type SupplierQueryDTO = {
  id: EntityId;
  accountId: EntityId;
  name: string;
  leadTime: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  productsSupplied: undefined | SuppliedProductQueryDTO[];
};

export type SupplierInclude = Partial<{
  productsSupplied: boolean;
}>;

export type SupplierDTO = {
  id: EntityId;
  accountId: EntityId;
  name: string;
  leadTime: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type SupplierDatabaseTable = {
  id: EntityId;
  account_id: EntityId;
  name: string;
  lead_time: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};
export class SupplierDAO {
  private tableName = "supplier";
  constructor(private readonly knex: Knex) {}
  async insert(table: SupplierDatabaseTable) {
    await this.knex<SupplierDatabaseTable>(this.tableName).insert({
      account_id: table.account_id,
      created_at: table.created_at,
      deleted_at: table.deleted_at,
      id: table.id,
      lead_time: table.lead_time,
      name: table.name,
    });
  }

  async delete(id: EntityId) {
    await this.knex(this.tableName).delete().where({ id: id });
  }

  async update(table: SupplierDatabaseTable) {
    await this.knex<SupplierDatabaseTable>(this.tableName)
      .update({
        account_id: table.account_id,
        created_at: table.created_at,
        deleted_at: table.deleted_at,
        id: table.id,
        lead_time: table.lead_time,
        name: table.name,
      })
      .where({ id: table.id });
  }
  async findById(id: EntityId): Promise<SupplierDTO | null> {
    const row = await this.knex<SupplierDatabaseTable>(this.tableName)
      .select("*")
      .where({ id: id })
      .first();
    if (!row) {
      return null;
    } else {
      return this.mapToDTO(row);
    }
  }

  async findByName(name: string): Promise<SupplierDTO | null> {
    const row = await this.knex<SupplierDatabaseTable>(this.tableName)
      .select("*")
      .where({ name: name })
      .first();
    if (!row) {
      return null;
    } else {
      return this.mapToDTO(row);
    }
  }

  async query(
    filters?: Partial<{
      name: SupplierName;
    }>,
    include?: SupplierInclude
  ) {
    const rows = await this.knex<SupplierDatabaseTable>(
      `${this.tableName} as s`
    ).select("s.*");
    const suppliers = [];
    for (const row of rows) {
      const included = await this.include(row.supplier_id, include);
      suppliers.push(this.mapToQueryDTO(row, included.productSupplied));
    }
    return suppliers;
  }

  async queryById(id: EntityId, include?: SupplierInclude) {
    const row = await this.knex<SupplierDatabaseTable>(`${this.tableName} as s`)
      .select("s.*")
      .where("s.id", "=", id)
      .first();
    if (!row) {
      return null;
    }
    const included = await this.include(row.supplier_id, include);
    return this.mapToQueryDTO(row, included.productSupplied);
  }

  async include(supplierId: EntityId, include: SupplierInclude | undefined) {
    if (!include) {
      return {
        productSupplied: undefined,
      };
    }

    let productsSupplied: undefined | SuppliedProductQueryDTO[] = undefined;
    if (include) {
      if (include.productsSupplied) {
        const suppliedProductDAO = new SuppliedProductDAO(this.knex);
        productsSupplied = await suppliedProductDAO.query({
          supplierId: supplierId,
        });
      }
    }
    return {
      productSupplied: productsSupplied,
    };
  }

  private mapToDTO(row: SupplierDatabaseTable): SupplierDTO {
    return {
      accountId: row.account_id,
      createdAt: row.created_at,
      deletedAt: row.deleted_at,
      id: row.id,
      leadTime: row.lead_time,
      name: row.name,
      updatedAt: row.updated_at,
    };
  }

  private mapToQueryDTO(
    row: SupplierDatabaseTable,
    productsSupplied: undefined | SuppliedProductQueryDTO[]
  ): SupplierQueryDTO {
    return {
      accountId: row.account_id,
      createdAt: row.created_at,
      deletedAt: row.deleted_at,
      id: row.id,
      leadTime: row.lead_time,
      name: row.name,
      updatedAt: row.updated_at,
      productsSupplied: productsSupplied,
    };
  }
}
