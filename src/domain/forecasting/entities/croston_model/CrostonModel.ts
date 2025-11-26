import { AggregateRoot } from "../../../../core/interfaces/AggregateRoot.js"
import { Entity } from "../../../../core/interfaces/Entity.js"
import { EntityId } from "../../../../core/types/EntityId.js"

class CrostonModel extends AggregateRoot {
	constructor(id: EntityId, productId: EntityId, trainedAt: Date, settings: ) {
		super(id)
	}
}

class CrostonModelSetting extends Entity{
	constructor(id: EntityId, crostonModelId: EntityId, alpha : number, variant: ){
		super(id)
	}

}
