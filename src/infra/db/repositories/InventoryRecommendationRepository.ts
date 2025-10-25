import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { InventoryRecommendation } from "../../../domain/inventory_recommendation/entities/inventory_recommendation/InventoryRecommendation.js"
import { IInventoryRecommendationRepository } from "../../../domain/inventory_recommendation/repositories/IInventoryRecommendationRepository.js"
import {
	InventoryRecommendationDao,
	InventoryRecommendationDto,
} from "../dao/InventoryRecommendationDao.js"
import { LeadTime } from "../../../domain/delivery_management/entities/supplier/value_objects/LeadTime.js"
import { InventoryStatus } from "../../../domain/inventory_recommendation/entities/inventory_recommendation/value_objects/InventoryStatus.js"

export class InventoryRecommendationRepository
	implements IInventoryRecommendationRepository
{
	private invRecDao: InventoryRecommendationDao
	constructor(knex: Knex) {
		this.invRecDao = new InventoryRecommendationDao(knex)
	}

	async findByForecastId(
		id: EntityId,
	): Promise<InventoryRecommendation | null> {
		const dto = await this.invRecDao.findByForecastId(id)
		if (!dto) {
			return null
		} else {
			return this.mapToEntity(dto)
		}
	}

	async delete(entity: InventoryRecommendation): Promise<void> {
		await this.invRecDao.delete(entity.id)
	}
	async update(entity: InventoryRecommendation): Promise<void> {
		await this.invRecDao.update({
			status: entity.status.value,
			coverage_days: entity.coverageDays,
			created_at: entity.createdAt,
			forecast_id: entity.forecastId,
			id: entity.id,
			leadtime: entity.leadTime.value,
			restock_amount: entity.restockAmount,
			restock_at: entity.restockAt,
			runs_out_at: entity.runsOutAt,
			supplier_id: entity.supplierId,
			updated_at: entity.updatedAt,
		})
	}
	async create(entity: InventoryRecommendation): Promise<void> {
		await this.invRecDao.insert({
			coverage_days: entity.coverageDays,
			status: entity.status.value,
			created_at: entity.createdAt,
			forecast_id: entity.forecastId,
			id: entity.id,
			leadtime: entity.leadTime.value,
			restock_amount: entity.restockAmount,
			restock_at: entity.restockAt,
			runs_out_at: entity.runsOutAt,
			supplier_id: entity.supplierId,
			updated_at: entity.updatedAt,
		})
	}

	async findById(id: EntityId): Promise<InventoryRecommendation | null> {
		const dto = await this.invRecDao.findById(id)
		if (!dto) {
			return null
		} else {
			return this.mapToEntity(dto)
		}
	}

	mapToEntity(dto: InventoryRecommendationDto): InventoryRecommendation {
		return InventoryRecommendation.create(
			dto.id,
			dto.forecastId,
			dto.supplierId,
			new LeadTime(dto.leadtime),
			new InventoryStatus(dto.status),
			dto.runsOutAt,
			dto.restockAt,
			dto.restockAmount,
			dto.coverageDays,
			dto.createdAt,
			dto.updatedAt,
		)
	}
}
