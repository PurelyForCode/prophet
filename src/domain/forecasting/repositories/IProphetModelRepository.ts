import { IRepository } from "../../../core/interfaces/Repository.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { ProphetModel } from "../entities/prophet_model/ProphetModel.js"

export interface IProphetModelRepository extends IRepository<ProphetModel> {
	doesProductHaveActiveModel(productId: EntityId): Promise<boolean>
}
