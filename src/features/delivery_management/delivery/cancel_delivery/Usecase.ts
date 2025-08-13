import { IDomainEventBus } from "../../../../core/interfaces/IDomainEventBus.js";
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { DeliveryNotFoundException } from "../../../../domain/delivery_management/exceptions/DeliveryNotFoundException.js";

export type CancelDeliveryInput = {
  deliveryId: EntityId;
};

export class CancelDeliveryUsecase {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly eventBus: IDomainEventBus
  ) {}
  async call(input: CancelDeliveryInput) {
    const deliveryRepo = this.uow.getDeliveryRepository();
    const delivery = await deliveryRepo.findById(input.deliveryId);
    if (!delivery) {
      throw new DeliveryNotFoundException();
    }
    delivery.cancel();
    await this.uow.save(delivery);
  }
}
