import { Repository } from "../../../core/interfaces/Repository.js";
import { Sale } from "../entities/sale/Sale.js";

export interface ISaleRepository extends Repository<Sale> {}
