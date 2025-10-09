import "dotenv/config"
import { knexInstance } from "../src/config/Knex.js"
import { generateSalesData, LinearPattern } from "./SalePatternPrototyping.js"
import { resetPrototype } from "./ResetPrototype.js"
import { createPrototypeProducts } from "./CreateProductPrototype.js"
import { ProductSetting } from "../src/domain/product_management/entities/product/value_objects/ProductSetting.js"

async function main() {
	await resetPrototype(knexInstance)
	const now = new Date()
	const { productId } = await createPrototypeProducts(
		"test",
		ProductSetting.defaultConfiguration(now),
	)

	await generateSalesData(knexInstance, productId, [
		{ days: 365, pattern: new LinearPattern({ max: 100, min: 1 }) },
	])

	await knexInstance.destroy()
}

main().catch((err) => {
	console.error("Script failed:", err)
	process.exit(1)
})
