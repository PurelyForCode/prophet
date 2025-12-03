import { Knex } from "knex"

export async function resetPrototype(knex: Knex) {
	await knex("product_group").delete()
	await knex("supplier").delete()
	await knex("sale").delete()
	await knex("account").delete()
}
