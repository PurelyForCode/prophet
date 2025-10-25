import { IRepository } from "../../../core/interfaces/Repository.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { InventoryRecommendation } from "../entities/inventory_recommendation/InventoryRecommendation.js"

export interface IInventoryRecommendationRepository
	extends IRepository<InventoryRecommendation> {
	findByForecastId(
		productId: EntityId,
	): Promise<null | InventoryRecommendation>
}
