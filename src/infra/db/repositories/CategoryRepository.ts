import { Knex } from "knex"
import { ICategoryRepository } from "../../../domain/product_management/repositories/ICategoryRepository.js"
import { CategoryDAO, CategoryDTO } from "../dao/CategoryDao.js"
import { Category } from "../../../domain/product_management/entities/category/Category.js"
import { CategoryName } from "../../../domain/product_management/entities/category/value_objects/CategoryName.js"
import { EntityId } from "../../../core/types/EntityId.js"

export class CategoryRepository implements ICategoryRepository {
	private readonly categoryDAO: CategoryDAO
	constructor(knex: Knex) {
		this.categoryDAO = new CategoryDAO(knex)
	}
	async findByName(name: CategoryName): Promise<null | Category> {
		const result = await this.categoryDAO.findByName(name.value)
		if (result) {
			return this.mapToEntity(result)
		} else {
			return null
		}
	}
	async delete(entity: Category): Promise<void> {
		await this.categoryDAO.delete(entity.id)
	}
	async update(entity: Category): Promise<void> {
		await this.categoryDAO.update({
			account_id: entity.getAccountId(),
			created_at: entity.getCreatedAt(),
			updated_at: entity.getUpdatedAt(),
			deleted_at: entity.getDeletedAt(),
			id: entity.id,
			name: entity.getName().value,
		})
	}
	async create(entity: Category): Promise<void> {
		await this.categoryDAO.insert({
			account_id: entity.getAccountId(),
			created_at: entity.getCreatedAt(),
			updated_at: entity.getUpdatedAt(),
			deleted_at: entity.getDeletedAt(),
			id: entity.id,
			name: entity.getName().value,
		})
	}
	async findById(id: EntityId): Promise<Category | null> {
		const result = await this.categoryDAO.findById(id)
		if (result) {
			return this.mapToEntity(result)
		} else {
			return null
		}
	}

	mapToEntity(category: CategoryDTO): Category {
		const name = new CategoryName(category.name)
		return Category.create({
			accountId: category.accountId,
			createdAt: category.createdAt,
			deletedAt: category.deletedAt,
			id: category.id,
			name: name,
			updatedAt: category.updatedAt,
		})
	}
}
