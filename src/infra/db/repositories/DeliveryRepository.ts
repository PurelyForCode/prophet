import { Knex } from "knex";
import { EntityId } from "../../../core/types/EntityId.js";
import { Delivery } from "../../../domain/delivery_management/entities/delivery/Delivery.js";
import { IDeliveryRepository } from "../../../domain/delivery_management/repositories/IDeliveryRepository.js";
import { DeliveryDAO, DeliveryDTO } from "../dao/DeliveryDao.js";
import { DeliveryItemRepository } from "./DeliveryItemRepository.js";
import { DeliveryItem } from "../../../domain/delivery_management/entities/delivery_item/DeliveryItem.js";
import { DeliveryStatus } from "../../../domain/delivery_management/entities/delivery/value_objects/DeliveryStatus.js";

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
			account_id: entity.getAccountId(),
			cancelled_at: entity.getCancelledAt(),
			completed_at: entity.getCompletedAt(),
			created_at: entity.getCreatedAt(),
			deleted_at: entity.getDeletedAt(),
			delivery_requested_at: entity.getDeliveryRequestedAt(),
			id: entity.id,
			scheduled_arrival_date: entity.getScheduledArrivalDate(),
			status: entity.getStatus().value,
			supplier_id: entity.getSupplierId(),
			updated_at: entity.getUpdatedAt(),
		});
	}
	async create(entity: Delivery): Promise<void> {
		await this.deliveryDAO.insert({
			account_id: entity.getAccountId(),
			cancelled_at: entity.getCancelledAt(),
			completed_at: entity.getCompletedAt(),
			created_at: entity.getCreatedAt(),
			deleted_at: entity.getDeletedAt(),
			delivery_requested_at: entity.getDeliveryRequestedAt(),
			id: entity.id,
			scheduled_arrival_date: entity.getScheduledArrivalDate(),
			status: entity.getStatus().value,
			supplier_id: entity.getSupplierId(),
			updated_at: entity.getUpdatedAt(),
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
		return Delivery.create({
			id: delivery.id,
			supplierId: delivery.supplierId,
			accountId: delivery.accountId,
			status: status,
			completedAt: delivery.completedAt,
			scheduledArrivalDate: delivery.scheduledArrivalDate,
			deliveryRequestedAt: delivery.deliveryRequestedAt,
			cancelledAt: delivery.cancelledAt,
			createdAt: delivery.createdAt,
			updatedAt: delivery.updatedAt,
			deletedAt: delivery.deletedAt,
			items: items,
		});
	}
}
