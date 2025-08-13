import { IDomainEventBus } from "../../../../core/interfaces/IDomainEventBus.js";
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { DeliveryItemQuantity } from "../../../../domain/delivery_management/entities/delivery_item/value_objects/DeliveryItemQuantity.js";
import { DeliveryNotFoundException } from "../../../../domain/delivery_management/exceptions/DeliveryNotFoundException.js";

export type UpdateItemInDeliveryInput = {
  deliveryId: EntityId;
  items: {
    id: EntityId;
    quantity: number;
  }[];
};

export class UpdateItemInDeliveryUsecase {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly eventBus: IDomainEventBus
  ) {}

  async call(input: UpdateItemInDeliveryInput) {
    const deliveryRepo = this.uow.getDeliveryRepository();
    const delivery = await deliveryRepo.findById(input.deliveryId);
    if (!delivery) {
      throw new DeliveryNotFoundException();
    }
    for (const item of input.items) {
      const quantity = new DeliveryItemQuantity(item.quantity);
      delivery.updateItem(item.id, { quantity: quantity });
    }
    await this.uow.save(delivery);
  }
}
