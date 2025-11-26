import { IRepository } from "../../../core/interfaces/Repository.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { ProductDelivery } from "../../inventory_recommendation/value_objects/ProductDelivery.js"
import { Delivery } from "../entities/delivery/Delivery.js"

export interface IDeliveryRepository extends IRepository<Delivery> {
	findProductDeliveries(productId: EntityId): Promise<ProductDelivery[]>
}
