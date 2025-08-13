import { Repository } from "../../../core/interfaces/Repository.js";
import { DeliveryItem } from "../entities/delivery_item/DeliveryItem.js";

export interface IDeliveryItemRepository extends Repository<DeliveryItem> {}
