import "dotenv/config"
import { knexInstance } from "../src/config/Knex.js"
import { generateSalesData, LinearPattern } from "./SalePatternPrototyping.js"
import { resetPrototype } from "./ResetPrototype.js"
import { createPrototypeProducts } from "./CreateProductPrototype.js"
import { ProductSetting } from "../src/domain/product_management/entities/product/value_objects/ProductSetting.js"

const productId = "0199c7d3-6473-75d9-abd5-8fa1bc2cf175"
const groupId = "0199c7d3-6473-75d9-abd5-88e78d9ccf56"

async function main() {
	await resetPrototype(knexInstance)
	const now = new Date()
	await createPrototypeProducts(
		groupId,
		productId,
		"test",
		ProductSetting.defaultConfiguration(now),
	)
	await generateSalesData(groupId, productId, [
		{ days: 365, pattern: new LinearPattern({ max: 100, min: 1 }) },
	])

	await knexInstance.destroy()
}

main().catch((err) => {
	console.error("Script failed:", err)
	process.exit(1)
})
