import { knexInstance } from "../src/config/Knex.js";
import { ProductDAO } from "../src/data/dao/ProductDAO.js";
import { fakeId } from "../src/fakeId.js";

export async function prototypeProduct(id: string) {
  const dao = new ProductDAO(knexInstance);
  const now = new Date();
  await dao.insert({
    account_id: fakeId,
    created_at: now,
    deleted_at: null,
    id: id,
    name: "test",
    product_category_id: null,
    safety_stock: 0,
    stock: 0,
    updated_at: now,
  });
}
