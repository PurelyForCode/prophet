import { IEventBus } from "../../../../core/interfaces/IDomainEventBus.js";
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { DeliveryNotFoundException } from "../../../../domain/delivery_management/exceptions/DeliveryNotFoundException.js";

export type RemoveItemOnDeliveryInput = {
  deliveryId: EntityId;
  itemIds: EntityId[];
};

export class RemoveItemOnDeliveryUsecase {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly eventBus: IEventBus
  ) {}

  async call(input: RemoveItemOnDeliveryInput) {
    const deliveryRepo = this.uow.getDeliveryRepository();
    const delivery = await deliveryRepo.findById(input.deliveryId);
    if (!delivery) {
      throw new DeliveryNotFoundException();
    }
    for (const id of input.itemIds) {
      delivery.removeItem(id);
    }
    await this.uow.save(delivery);
  }
}
