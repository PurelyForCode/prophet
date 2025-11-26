import { Hono } from "hono"
import {
	InventoryRecommendationQueryDao,
	InventoryRecommendationSortableFields,
} from "../../infra/db/query_dao/InventoryRecommendationQueryDao.js"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { sortStringSchema } from "../validation/SortStringSchema.js"
import { InventoryStatusValues } from "../../domain/inventory_recommendation/entities/inventory_recommendation/value_objects/InventoryStatus.js"
import { knexInstance } from "../../config/Knex.js"
import { runInTransaction, UnitOfWork } from "../../infra/utils/UnitOfWork.js"
import { repositoryFactory } from "../../infra/utils/RepositoryFactory.js"
import { IsolationLevel } from "../../core/interfaces/IUnitOfWork.js"
import { idGenerator } from "../../infra/utils/IdGenerator.js"
import { CreateInventoryRecommendationUsecase } from "../../application/inventory_recommendation/create_inventory_recommendation/Usecase.js"
import { authorize } from "../middleware/AuthorizeMiddleware.js"

const app = new Hono()

app.get(
	"/",
	authorize(["MANAGE_RECOMMENDATIONS"]),
	zValidator(
		"query",
		z
			.object({
				sort: sortStringSchema(
					new Set<InventoryRecommendationSortableFields>(["status"]),
				),
				limit: z.coerce.number().int().positive(),
				offset: z.coerce.number().int().nonnegative(),
				status: z.enum<InventoryStatusValues[]>([
					"urgent",
					"critical",
					"warning",
					"good",
				]),
				supplierId: z.uuidv7(),
				productId: z.uuidv7(),
			})
			.partial(),
	),
	async (c) => {
		const invQueryDao = new InventoryRecommendationQueryDao(knexInstance)
		const query = c.req.valid("query")
		const data = await invQueryDao.query(
			{ limit: query.limit, offset: query.offset },
			{
				productId: query.productId,
				status: query.status,
				supplierId: query.supplierId,
			},
			query.sort,
		)
		return c.json({ data: data })
	},
)

app.post(
	"/",
	authorize(["MANAGE_RECOMMENDATIONS"]),
	zValidator("json", z.object({ forecastId: z.uuidv7() })),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new CreateInventoryRecommendationUsecase(
			uow,
			idGenerator,
		)
		const body = c.req.valid("json")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			// TODO: make the coverage days taken from the global settings
			await usecase.call({
				coverageDays: 14,
				forecastId: body.forecastId,
			})
		})
		return c.json({
			message: "Successfully generated inventory recommendation",
		})
	},
)

export default app
