import { Repository } from "../../../core/interfaces/Repository.js";
import { Delivery } from "../entities/delivery/Delivery.js";

export interface IDeliveryRepository extends Repository<Delivery> {}
