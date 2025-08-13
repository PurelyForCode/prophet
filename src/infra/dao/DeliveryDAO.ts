import { Knex } from "knex";
import { EntityId } from "../../core/types/EntityId.js";
import { DeliveryStatus } from "../../domain/delivery_management/entities/delivery/value_objects/DeliveryStatus.js";

export type DeliveryDTO = {
  id: EntityId;
  supplierId: EntityId;
  accountId: EntityId;
  status: string;
  completedAt: Date | null;
  deliveryRequestedAt: Date;
  scheduledArrivalDate: Date;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type DeliveryDatabaseTable = {
  id: EntityId;
  supplier_id: EntityId;
  account_id: EntityId;
  status: string;
  completed_at: Date | null;
  delivery_requested_at: Date;
  scheduled_arrival_date: Date;
  cancelled_at: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export class DeliveryDAO {
  constructor(private readonly knex: Knex) {}
  private tableName = "delivery_item";
  async insert(table: DeliveryDatabaseTable) {
    await this.knex<DeliveryDatabaseTable>(this.tableName).insert({
      account_id: table.account_id,
      cancelled_at: table.cancelled_at,
      completed_at: table.completed_at,
      created_at: table.created_at,
      deleted_at: table.deleted_at,
      delivery_requested_at: table.delivery_requested_at,
      id: table.id,
      scheduled_arrival_date: table.scheduled_arrival_date,
      status: table.status,
      supplier_id: table.supplier_id,
      updated_at: table.updated_at,
    });
  }
  async delete(deliveryItemId: EntityId) {
    await this.knex(this.tableName).delete().where({ id: deliveryItemId });
  }
  async update(table: DeliveryDatabaseTable) {
    await this.knex<DeliveryDatabaseTable>(this.tableName)
      .update({
        account_id: table.account_id,
        cancelled_at: table.cancelled_at,
        completed_at: table.completed_at,
        created_at: table.created_at,
        deleted_at: table.deleted_at,
        delivery_requested_at: table.delivery_requested_at,
        id: table.id,
        scheduled_arrival_date: table.scheduled_arrival_date,
        status: table.status,
        supplier_id: table.supplier_id,
        updated_at: table.updated_at,
      })
      .where({ id: table.id });
  }

  async findById(id: EntityId): Promise<DeliveryDTO | null> {
    const row = await this.knex<DeliveryDatabaseTable>(this.tableName)
      .select("*")
      .where({ id: id })
      .first();
    if (!row) {
      return null;
    } else {
      return this.mapToDTO(row);
    }
  }

  async findAllByDeliveryStatus(
    status: DeliveryStatus
  ): Promise<DeliveryDTO[]> {
    const rows = await this.knex<DeliveryDatabaseTable>(this.tableName)
      .select("*")
      .where({ status: status.value });
    const deliveries = [];
    for (const row of rows) {
      deliveries.push(this.mapToDTO(row));
    }
    return deliveries;
  }

  mapToDTO(row: DeliveryDatabaseTable): DeliveryDTO {
    return {
      accountId: row.account_id,
      cancelledAt: row.cancelled_at,
      completedAt: row.completed_at,
      createdAt: row.created_at,
      deletedAt: row.deleted_at,
      deliveryRequestedAt: row.delivery_requested_at,
      id: row.id,
      scheduledArrivalDate: row.scheduled_arrival_date,
      status: row.status,
      supplierId: row.supplier_id,
      updatedAt: row.updated_at,
    };
  }
}
