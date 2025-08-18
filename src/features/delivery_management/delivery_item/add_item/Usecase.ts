import { IDomainEventBus } from "../../../../core/interfaces/IDomainEventBus.js";
import { IIdGenerator } from "../../../../core/interfaces/IIdGenerator.js";
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { DeliveryItem } from "../../../../domain/delivery_management/entities/delivery_item/DeliveryItem.js";
import { DeliveryItemQuantity } from "../../../../domain/delivery_management/entities/delivery_item/value_objects/DeliveryItemQuantity.js";
import { DeliveryNotFoundException } from "../../../../domain/delivery_management/exceptions/DeliveryNotFoundException.js";

export type AddItemToDeliveryInput = {
  deliveryId: EntityId;
  items: {
    quantity: number;
    productId: EntityId;
    variantId: EntityId | null;
  }[];
};

export class AddItemToDeliveryUsecase {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly eventBus: IDomainEventBus,
    private readonly idGenerator: IIdGenerator
  ) {}

  async call(input: AddItemToDeliveryInput) {
    const deliveryRepo = this.uow.getDeliveryRepository();
    const delivery = await deliveryRepo.findById(input.deliveryId);
    if (!delivery) {
      throw new DeliveryNotFoundException();
    }
    for (const item of input.items) {
      const id = this.idGenerator.generate();
      const quantity = new DeliveryItemQuantity(item.quantity);
      const deliveryItem = DeliveryItem.create({
        id: id,
        productId: item.productId,
        deliveryId: input.deliveryId,
        quantity: quantity,
      });
      delivery.addItem(deliveryItem);
    }
    await this.uow.save(delivery);
  }
}
