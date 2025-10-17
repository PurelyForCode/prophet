import { EntityId } from "../../../core/types/EntityId.js"
import { ProphetModel } from "../entities/prophet_model/ProphetModel.js"

export class ProphetModelManager {
	createProphetModel(id: EntityId, productId: EntityId): ProphetModel {
		const prophetModel = ProphetModel.create(
			id,
			productId,
			null,
			false,
			null,
		)
		return prophetModel
	}
}
