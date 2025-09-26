import { Knex } from "knex";
import { EntityId } from "../../../core/types/EntityId.js";
import { DeliveryItem } from "../../../domain/delivery_management/entities/delivery_item/DeliveryItem.js";
import { IDeliveryItemRepository } from "../../../domain/delivery_management/repositories/IDeliveryItemRepository.js";
import { DeliveryItemDAO, DeliveryItemDTO } from "../dao/DeliveryItemDao.js";
import { DeliveryItemQuantity } from "../../../domain/delivery_management/entities/delivery_item/value_objects/DeliveryItemQuantity.js";

export class DeliveryItemRepository implements IDeliveryItemRepository {
	private deliveryItemDAO: DeliveryItemDAO;
	constructor(knex: Knex) {
		this.deliveryItemDAO = new DeliveryItemDAO(knex);
	}
	async delete(entity: DeliveryItem): Promise<void> {
		await this.deliveryItemDAO.delete(entity.id);
	}
	async update(entity: DeliveryItem): Promise<void> {
		await this.deliveryItemDAO.update({
			delivery_id: entity.getDeliveryId(),
			id: entity.id,
			product_id: entity.getProductId(),
			quantity: entity.getQuantity().value,
		});
	}
	async create(entity: DeliveryItem): Promise<void> {
		await this.deliveryItemDAO.insert({
			delivery_id: entity.getDeliveryId(),
			id: entity.id,
			product_id: entity.getProductId(),
			quantity: entity.getQuantity().value,
		});
	}

	async findById(id: EntityId): Promise<DeliveryItem | null> {
		const row = await this.deliveryItemDAO.findById(id);
		if (!row) {
			return null;
		} else {
			return this.mapToEntity(row);
		}
	}

	async findByDeliveryId(
		deliveryId: EntityId
	): Promise<Map<EntityId, DeliveryItem>> {
		const rows = await this.deliveryItemDAO.findByDeliveryId(deliveryId);
		const deliveryItems = new Map();
		for (const row of rows) {
			const deliveryItem = this.mapToEntity(row);
			deliveryItems.set(deliveryItem.id, deliveryItem);
		}
		return deliveryItems;
	}

	private mapToEntity(item: DeliveryItemDTO): DeliveryItem {
		const quantity = new DeliveryItemQuantity(item.quantity);
		return DeliveryItem.create({
			id: item.id,
			productId: item.productId,
			deliveryId: item.deliveryId,
			quantity: quantity,
		});
	}
}
