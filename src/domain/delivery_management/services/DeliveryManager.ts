import { EntityId } from "../../../core/types/EntityId.js";
import { Delivery } from "../entities/delivery/Delivery.js";
import { DeliveryStatus } from "../entities/delivery/value_objects/DeliveryStatus.js";
import { Supplier } from "../entities/supplier/Supplier.js";

export class DeliveryManager {
  createDelivery(
    supplier: Supplier,
    params: {
      id: EntityId;
      accountId: EntityId;
      status: DeliveryStatus;
    }
  ) {
    const now = new Date();
    const scheduledArrivalDate = new Date();
    scheduledArrivalDate.setDate(scheduledArrivalDate.getDate() + 7);
    const delivery = Delivery.create(
      params.id,
      supplier.id,
      params.accountId,
      params.status,
      null,
      scheduledArrivalDate,
      now,
      null,
      now,
      now,
      null,
      new Map()
    );
    return delivery;
  }
  archiveDelivery(delivery: Delivery) {
    delivery.archive();
  }
  updateDelivery() {}
}
