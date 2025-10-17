import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { Sale } from "../../../domain/sales/entities/sale/Sale.js"
import { ISaleRepository } from "../../../domain/sales/repositories/ISaleRepository.js"
import { SaleDAO, SaleDto } from "../dao/SaleDAO.js"
import { SaleQuantity } from "../../../domain/sales/entities/sale/value_objects/SaleQuantity.js"
import {
	SaleStatus,
	SaleStatusValues,
} from "../../../domain/sales/entities/sale/value_objects/SaleStatus.js"

export class SaleRepository implements ISaleRepository {
	private readonly saleDAO: SaleDAO
	constructor(knex: Knex) {
		this.saleDAO = new SaleDAO(knex)
	}

	async doesSaleExistInDate(date: Date): Promise<boolean> {
		return await this.saleDAO.doesSaleExistInDate(date)
	}

	async findById(id: EntityId): Promise<Sale | null> {
		const saleDTO = await this.saleDAO.findById(id)
		if (saleDTO) {
			return this.mapToEntity(saleDTO)
		} else {
			return null
		}
	}

	async delete(entity: Sale): Promise<void> {
		await this.saleDAO.delete(entity.id)
	}

	async update(entity: Sale): Promise<void> {
		await this.saleDAO.update({
			account_id: entity.getAccountId(),
			created_at: entity.getCreatedAt(),
			date: entity.getDate(),
			deleted_at: entity.getDeletedAt(),
			id: entity.id,
			product_id: entity.getProductId(),
			quantity: entity.getQuantity().value,
			status: entity.getStatus().value,
			updated_at: entity.getUpdatedAt(),
		})
	}

	async create(entity: Sale): Promise<void> {
		await this.saleDAO.insert({
			account_id: entity.getAccountId(),
			created_at: entity.getCreatedAt(),
			date: entity.getDate(),
			deleted_at: entity.getDeletedAt(),
			id: entity.id,
			product_id: entity.getProductId(),
			quantity: entity.getQuantity().value,
			status: entity.getStatus().value,
			updated_at: entity.getUpdatedAt(),
		})
	}

	mapToEntity(sale: SaleDto): Sale {
		const quantity = new SaleQuantity(sale.quantity)
		const status = new SaleStatus(sale.status as SaleStatusValues)
		return Sale.create({
			accountId: sale.account_id,
			createdAt: sale.created_at,
			date: sale.date,
			deletedAt: sale.deleted_at,
			id: sale.id,
			productId: sale.product_id,
			quantity: quantity,
			status: status,
			updatedAt: sale.updated_at,
		})
	}
}
