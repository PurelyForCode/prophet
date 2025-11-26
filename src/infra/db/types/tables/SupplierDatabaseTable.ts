import { EntityId } from "../../../../core/types/EntityId.js";


export type SupplierDatabaseTable = {
	id: EntityId;
	account_id: EntityId;
	name: string;
	lead_time: number;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date | null;
};

