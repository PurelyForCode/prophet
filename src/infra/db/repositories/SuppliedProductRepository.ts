import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { SuppliedProduct } from "../../../domain/delivery_management/entities/supplied_product/SuppliedProduct.js"
import { ISuppliedProductRepository } from "../../../domain/delivery_management/repositories/ISuppliedProductRepository.js"
import {
	SuppliedProductDAO,
	SuppliedProductDTO,
} from "../dao/SuppliedProductDao.js"
import { EntityCollection } from "../../../core/types/EntityCollection.js"
import { SuppliedProductMin } from "../../../domain/delivery_management/entities/supplied_product/value_objects/SuppliedProductMin.js"
import { SuppliedProductMax } from "../../../domain/delivery_management/entities/supplied_product/value_objects/SuppliedProductMax.js"

export class SuppliedProductRepository implements ISuppliedProductRepository {
	private suppliedProductDAO: SuppliedProductDAO
	constructor(knex: Knex) {
		this.suppliedProductDAO = new SuppliedProductDAO(knex)
	}

	async isProductSupplied(
		productId: EntityId,
		supplierId: EntityId,
	): Promise<boolean> {
		return await this.suppliedProductDAO.isProductSupplied(
			productId,
			supplierId,
		)
	}

	async doesProductHaveDefaultSupplier(
		productId: EntityId,
	): Promise<boolean> {
		return await this.suppliedProductDAO.doesProductHaveDefaultSupplier(
			productId,
		)
	}

	async delete(entity: SuppliedProduct): Promise<void> {
		this.suppliedProductDAO.delete(entity.id)
	}
	async update(entity: SuppliedProduct): Promise<void> {
		await this.suppliedProductDAO.update({
			id: entity.id,
			max_orderable: entity.getMax().value,
			min_orderable: entity.getMin().value,
			product_id: entity.getProductId(),
			supplier_id: entity.getSupplierId(),
			is_default: entity.getIsDefault(),
		})
	}
	async create(entity: SuppliedProduct): Promise<void> {
		await this.suppliedProductDAO.insert({
			id: entity.id,
			max_orderable: entity.getMax().value,
			min_orderable: entity.getMin().value,
			product_id: entity.getProductId(),
			supplier_id: entity.getSupplierId(),
			is_default: entity.getIsDefault(),
		})
	}

	async findById(id: EntityId): Promise<SuppliedProduct | null> {
		const dto = await this.suppliedProductDAO.findById(id)
		if (!dto) {
			return null
		} else {
			return this.mapToEntity(dto)
		}
	}

	async findAllBySupplierId(
		supplierId: EntityId,
	): Promise<EntityCollection<SuppliedProduct>> {
		const suppliedProductDTOs =
			await this.suppliedProductDAO.findAllBySupplierId(supplierId)
		const suppliedProducts = new Map()
		for (const row of suppliedProductDTOs) {
			const suppliedProduct = this.mapToEntity(row)
			suppliedProducts.set(
				suppliedProduct.getProductId(),
				suppliedProduct,
			)
		}
		return suppliedProducts
	}

	private mapToEntity(row: SuppliedProductDTO): SuppliedProduct {
		const min = new SuppliedProductMin(row.min)
		const max = new SuppliedProductMax(row.max)

		return SuppliedProduct.create({
			id: row.id,
			productId: row.productId,
			supplierId: row.supplierId,
			min: min,
			max: max,
			isDefault: row.isDefault,
		})
	}
}
