import { IRepository } from "../../../core/interfaces/Repository.js"
import { Sale } from "../entities/sale/Sale.js"

export interface ISaleRepository extends IRepository<Sale> {
	doesSaleExistInDate(date: Date): Promise<boolean>
}
