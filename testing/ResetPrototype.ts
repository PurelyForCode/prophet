import { Knex } from "knex"

export async function resetPrototype(knex: Knex) {
	await knex("group").delete()
	await knex("sale").delete()
}
