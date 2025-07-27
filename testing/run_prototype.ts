import { knexInstance } from "../src/config/Knex.js";
import { generateSalesData, LinearPattern } from "./SalePatternPrototyping.js";
import { prototypeProduct } from "./CreateProductPrototype.js";
import { resetPrototype } from "./ResetPrototype.js";

const id = "01983217-4037-75f5-a7a5-e30ecc225c35";

async function main() {
  await resetPrototype(knexInstance);
  await prototypeProduct(id);
  await generateSalesData(knexInstance, id, undefined, [
    { days: 365, pattern: new LinearPattern({ max: 100, min: 1 }) },
  ]);

  console.log("✅ Sales data generation complete.");
  // 🚀 Close Knex to ensure Node exits
  await knexInstance.destroy();
}

// Run and catch errors
main().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});
