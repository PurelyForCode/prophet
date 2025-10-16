import { IRepository } from "../../../core/interfaces/Repository.js"
import { InventoryRecommendation } from "../entities/inventory_recommendation/InventoryRecommendation.js"

export interface IInventoryRecommendationRepository
	extends IRepository<InventoryRecommendation> {}
