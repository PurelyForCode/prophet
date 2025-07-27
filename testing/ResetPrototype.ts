import { Knex } from "knex";

export async function resetPrototype(knex: Knex) {
  await knex("product").delete();
  await knex("sale").delete();
}
