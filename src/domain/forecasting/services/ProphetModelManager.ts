import { EntityAction } from "../../../core/interfaces/AggregateRoot.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { ProphetModel } from "../entities/prophet_model/ProphetModel.js"

export class ProphetModelManager {
	createProphetModel(
		id: EntityId,
		productId: EntityId,
		isActive: boolean,
	): ProphetModel {
		const prophetModel = ProphetModel.create(
			id,
			productId,
			null,
			isActive,
			null,
			new Map(),
			new Map(),
			new Map(),
		)
		prophetModel.addTrackedEntity(prophetModel, EntityAction.created)
		return prophetModel
	}
	archiveProphetModel(model: ProphetModel) {
		model.archive
	}
}
