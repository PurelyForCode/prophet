import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"

export class BaseQueryDao {
	constructor(
		protected readonly knex: Knex,
		protected readonly tableName: string,
	) {}

	async exists(id: EntityId, archived?: boolean): Promise<boolean> {
		const builder = this.knex(this.tableName)
			.select(1)
			.where("id", "=", id)
			.first()
		if (archived === true) {
			builder.whereNotNull("deleted_at")
		} else if (archived === false) {
			builder.whereNull("deleted_at")
		}

		const row = await builder
		return !!row
	}
}
