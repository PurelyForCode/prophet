import { EntityId } from "../../../../core/types/EntityId.js";


export type SuppliedProductDatabaseTable = {
	id: EntityId;
	product_id: EntityId;
	supplier_id: EntityId;
	min_orderable: number;
	max_orderable: number;
};

