import "dotenv/config"
import { knexInstance } from "../src/config/Knex.js"
import { resetPrototype } from "./ResetPrototype.js"
import { createPrototypeProducts } from "./CreateProductPrototype.js"
import { ProductSetting } from "../src/domain/product_management/entities/product/value_objects/ProductSetting.js"
import {
	generateSalesData,
	SeasonalPattern,
	StablePattern,
} from "./SalePattern.js"
import { runInTransaction, UnitOfWork } from "../src/infra/utils/UnitOfWork.js"
import { repositoryFactory } from "../src/infra/utils/RepositoryFactory.js"
import { CreateSaleUsecase } from "../src/application/sales_management/create_sale/Usecase.js"
import { idGenerator } from "../src/infra/utils/IdGenerator.js"
import { domainEventBus } from "../src/infra/events/EventBusConfiguration.js"
import { IsolationLevel } from "../src/core/interfaces/IUnitOfWork.js"
import { fakeId } from "../src/fakeId.js"

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

	await generateSalesData(
		{
			accountId: fakeId,
			groupId,
			productId,
			startDate: new Date(), // note: month index starts at 0, so 10 = November
			patterns: [
				// --- Year 1 ---
				{
					name: "Year 1 Jan–Feb spike",
					days: 60,
					pattern: new SeasonalPattern(80, 100, 30),
				},
				{
					name: "Year 1 Mar–Dec stable",
					days: 305,
					pattern: new StablePattern(50, 5),
				},

				// --- Year 2 ---
				{
					name: "Year 2 Jan–Feb spike",
					days: 60,
					pattern: new SeasonalPattern(80, 100, 30),
				},
				{
					name: "Year 2 Mar–Dec stable",
					days: 305,
					pattern: new StablePattern(50, 5),
				},
			],
		},
		async (input) => {
			const uow = new UnitOfWork(knexInstance, repositoryFactory)
			const usecase = new CreateSaleUsecase(
				uow,
				idGenerator,
				domainEventBus,
			)
			await runInTransaction(
				uow,
				IsolationLevel.READ_COMMITTED,
				async () => {
					await usecase.call(input)
				},
			)
		},
	)

	await knexInstance.destroy()
}

main().catch((err) => {
	console.error("Script failed:", err)
	process.exit(1)
})
