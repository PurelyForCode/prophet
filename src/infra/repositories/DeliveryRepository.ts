import { Knex } from "knex";
import { EntityId } from "../../core/types/EntityId.js";
import { Delivery } from "../../domain/delivery_management/entities/delivery/Delivery.js";
import { IDeliveryRepository } from "../../domain/delivery_management/repositories/IDeliveryRepository.js";
import { DeliveryDAO, DeliveryDTO } from "../dao/DeliveryDAO.js";
import { DeliveryItemRepository } from "./DeliveryItemRepository.js";
import { DeliveryItem } from "../../domain/delivery_management/entities/delivery_item/DeliveryItem.js";
import { DeliveryStatus } from "../../domain/delivery_management/entities/delivery/value_objects/DeliveryStatus.js";

export class DeliveryRepository implements IDeliveryRepository {
  private deliveryDAO: DeliveryDAO;
  private deliveryItemRepo: DeliveryItemRepository;

  constructor(knex: Knex) {
    this.deliveryDAO = new DeliveryDAO(knex);
    this.deliveryItemRepo = new DeliveryItemRepository(knex);
  }

  async delete(entity: Delivery): Promise<void> {
    await this.deliveryDAO.delete(entity.id);
  }

  async update(entity: Delivery): Promise<void> {
    await this.deliveryDAO.update({
      account_id: entity.accountId,
      cancelled_at: entity.cancelledAt,
      completed_at: entity.completedAt,
      created_at: entity.createdAt,
      deleted_at: entity.deletedAt,
      delivery_requested_at: entity.deliveryRequestedAt,
      id: entity.id,
      scheduled_arrival_date: entity.scheduledArrivalDate,
      status: entity.status.value,
      supplier_id: entity.supplierId,
      updated_at: entity.updatedAt,
    });
  }
  async create(entity: Delivery): Promise<void> {
    await this.deliveryDAO.insert({
      account_id: entity.accountId,
      cancelled_at: entity.cancelledAt,
      completed_at: entity.completedAt,
      created_at: entity.createdAt,
      deleted_at: entity.deletedAt,
      delivery_requested_at: entity.deliveryRequestedAt,
      id: entity.id,
      scheduled_arrival_date: entity.scheduledArrivalDate,
      status: entity.status.value,
      supplier_id: entity.supplierId,
      updated_at: entity.updatedAt,
    });
  }

  async findById(id: EntityId): Promise<Delivery | null> {
    const deliveryDTO = await this.deliveryDAO.findById(id);
    if (!deliveryDTO) {
      return null;
    }
    const deliveryItems = await this.deliveryItemRepo.findByDeliveryId(
      deliveryDTO.id
    );
    return this.mapToEntity(deliveryDTO, deliveryItems);
  }

  private mapToEntity(
    delivery: DeliveryDTO,
    items: Map<EntityId, DeliveryItem>
  ) {
    const status = new DeliveryStatus(delivery.status);
    return Delivery.create(
      delivery.id,
      delivery.supplierId,
      delivery.accountId,
      status,
      delivery.completedAt,
      delivery.scheduledArrivalDate,
      delivery.deliveryRequestedAt,
      delivery.cancelledAt,
      delivery.createdAt,
      delivery.updatedAt,
      delivery.deletedAt,
      items
    );
  }
}
