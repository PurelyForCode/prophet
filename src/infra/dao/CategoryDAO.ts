import { Knex } from "knex";
import { EntityId } from "../../core/types/EntityId.js";

export type CategoryDTO = {};

export type CategoryQueryDTO = {};

export type CategoryInclude = {};

export type CategoryFilters = {};

export type CategoryDatabaseTable = {
  id: EntityId;
  account_id: EntityId;
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export class CategoryDAO {
  private tableName = "product_category";
  constructor(private readonly knex: Knex) {}

  async insert(table: CategoryDatabaseTable) {}
  async update() {}
  async delete() {}
}
