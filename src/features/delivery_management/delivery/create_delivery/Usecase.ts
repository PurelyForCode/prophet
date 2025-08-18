import { IDomainEventBus } from "../../../../core/interfaces/IDomainEventBus.js";
import { IIdGenerator } from "../../../../core/interfaces/IIdGenerator.js";
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js";
import { EntityId } from "../../../../core/types/EntityId.js";
import { DeliveryStatus } from "../../../../domain/delivery_management/entities/delivery/value_objects/DeliveryStatus.js";
import { DeliveryItem } from "../../../../domain/delivery_management/entities/delivery_item/DeliveryItem.js";
import { DeliveryItemQuantity } from "../../../../domain/delivery_management/entities/delivery_item/value_objects/DeliveryItemQuantity.js";
import { SupplierNotFoundException } from "../../../../domain/delivery_management/exceptions/SupplierNotFoundException.js";
import { DeliveryManager } from "../../../../domain/delivery_management/services/DeliveryManager.js";

export type CreateDeliveryInput = {
  accountId: EntityId;
  supplierId: EntityId;
  status: string;
  items:
    | {
        quantity: number;
        productId: EntityId;
        variantId: EntityId | null;
      }[]
    | undefined;
};

export class CreateDeliveryUsecase {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly eventBus: IDomainEventBus,
    private readonly idGenerator: IIdGenerator
  ) {}
  async call(input: CreateDeliveryInput) {
    const supplierRepo = this.uow.getSupplierRepository();
    const supplier = await supplierRepo.findById(input.supplierId);
    if (!supplier) {
      throw new SupplierNotFoundException();
    }
    const id = this.idGenerator.generate();
    const status = new DeliveryStatus(input.status);
    const deliveryManager = new DeliveryManager();
    const delivery = deliveryManager.createDelivery(supplier, {
      accountId: input.accountId,
      id: id,
      status: status,
    });
    if (input.items) {
      for (const item of input.items) {
        const id = this.idGenerator.generate();
        const quantity = new DeliveryItemQuantity(item.quantity);
        const deliveryItem = DeliveryItem.create({
          id: id,
          productId: item.productId,
          deliveryId: delivery.id,
          quantity: quantity,
        });
        delivery.addItem(deliveryItem);
      }
    }
    await this.uow.save(delivery);
  }
}
