import { IEventBus } from "../../../../core/interfaces/IDomainEventBus.js";
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { DeliveryNotFoundException } from "../../../../domain/delivery_management/exceptions/DeliveryNotFoundException.js";

export type ConfirmDeliveryArrivalInput = {
  deliveryId: EntityId;
};

export class ConfirmDeliveryArrivalUsecase {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly eventBus: IEventBus
  ) {}
  async call(input: ConfirmDeliveryArrivalInput) {
    const deliveryRepo = this.uow.getDeliveryRepository();
    const delivery = await deliveryRepo.findById(input.deliveryId);
    if (!delivery) {
      throw new DeliveryNotFoundException();
    }
    delivery.arrived();
    await this.uow.save(delivery);
  }
}
