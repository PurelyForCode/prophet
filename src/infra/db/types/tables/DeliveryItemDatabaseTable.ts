import { EntityId } from "../../../../core/types/EntityId.js";


export type DeliveryItemDatabaseTable = {
	id: EntityId;
	product_id: EntityId;
	delivery_id: EntityId;
	quantity: number;
};

