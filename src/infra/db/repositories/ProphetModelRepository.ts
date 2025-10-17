import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { ProphetModel } from "../../../domain/forecasting/entities/prophet_model/ProphetModel.js"
import { IProphetModelRepository } from "../../../domain/forecasting/repositories/IProphetModelRepository.js"
import { ProphetModelDAO, ProphetModelDTO } from "../dao/ProphetModelDao.js"

export class ProphetModelRepository implements IProphetModelRepository {
	private prophetModelDao: ProphetModelDAO
	constructor(knex: Knex) {
		this.prophetModelDao = new ProphetModelDAO(knex)
	}
	async doesProductHaveModel(productId: EntityId): Promise<boolean> {
		return await this.prophetModelDao.doesProductHaveModel(productId)
	}
	async delete(entity: ProphetModel): Promise<void> {
		await this.prophetModelDao.delete(entity.id)
	}
	async update(entity: ProphetModel): Promise<void> {
		await this.prophetModelDao.update({
			active: entity.active,
			file_path: entity.filePath,
			id: entity.id,
			product_id: entity.productId,
			trained_at: entity.trainedAt,
		})
	}
	async create(entity: ProphetModel): Promise<void> {
		await this.prophetModelDao.insert({
			active: entity.active,
			file_path: entity.filePath,
			id: entity.id,
			product_id: entity.productId,
			trained_at: entity.trainedAt,
		})
	}

	async findById(id: EntityId): Promise<ProphetModel | null> {
		const row = await this.prophetModelDao.findById(id)
		if (!row) {
			return null
		} else {
			return this.mapToEntity(row)
		}
	}

	mapToEntity(row: ProphetModelDTO): ProphetModel {
		return ProphetModel.create(
			row.id,
			row.productId,
			row.filePath,
			row.active,
			row.trainedAt,
		)
	}
}
