import { IRepository } from "../../../core/interfaces/Repository.js";
import { Delivery } from "../entities/delivery/Delivery.js";

export interface IDeliveryRepository extends IRepository<Delivery> {}
