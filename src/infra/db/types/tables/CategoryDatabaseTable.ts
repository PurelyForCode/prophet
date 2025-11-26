import { EntityId } from "../../../../core/types/EntityId.js";

export type CategoryDatabaseTable = {
	id: EntityId;
	account_id: EntityId;
	name: string;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date | null;
};
