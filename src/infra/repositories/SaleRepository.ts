import { Knex } from "knex";
import { EntityId } from "../../core/types/EntityId.js";
import { Sale } from "../../domain/sales/entities/sale/Sale.js";
import { ISaleRepository } from "../../domain/sales/repositories/ISaleRepository.js";
import { SaleDAO, SaleDTO } from "../dao/SaleDAO.js";
import { SaleQuantity } from "../../domain/sales/entities/sale/value_objects/SaleQuantity.js";
import {
  SaleStatus,
  SaleStatusValues,
} from "../../domain/sales/entities/sale/value_objects/SaleStatus.js";
import { en } from "zod/locales";

export class SaleRepository implements ISaleRepository {
  private readonly saleDAO: SaleDAO;
  constructor(private readonly knex: Knex) {
    this.saleDAO = new SaleDAO(knex);
  }

  async findById(id: EntityId): Promise<Sale | null> {
    const saleDTO = await this.saleDAO.findById(id);
    if (saleDTO) {
      return this.mapToEntity(saleDTO);
    } else {
      return null;
    }
  }

  async delete(entity: Sale): Promise<void> {
    await this.saleDAO.delete(entity.id);
  }

  async update(entity: Sale): Promise<void> {
    await this.saleDAO.update({
      account_id: entity.accountId,
      created_at: entity.createdAt,
      date: entity.date,
      deleted_at: entity.deletedAt,
      id: entity.id,
      product_id: entity.productId,
      quantity: entity.quantity.value,
      status: entity.status.value,
      updated_at: entity.updatedAt,
      variant_id: entity.variantId,
    });
  }

  async create(entity: Sale): Promise<void> {
    await this.saleDAO.insert({
      account_id: entity.accountId,
      created_at: entity.createdAt,
      date: entity.date,
      deleted_at: entity.deletedAt,
      id: entity.id,
      product_id: entity.productId,
      quantity: entity.quantity.value,
      status: entity.status.value,
      updated_at: entity.updatedAt,
      variant_id: entity.variantId,
    });
  }

  mapToEntity(sale: SaleDTO): Sale {
    const quantity = new SaleQuantity(sale.quantity);
    const status = new SaleStatus(sale.status as SaleStatusValues);
    return Sale.create(
      sale.id,
      sale.account_id,
      sale.product_id,
      sale.variant_id,
      quantity,
      status,
      sale.date,
      sale.created_at,
      sale.updated_at,
      sale.deleted_at
    );
  }
}
