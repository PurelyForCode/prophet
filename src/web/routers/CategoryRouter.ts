import { Hono } from "hono"
import { CreateCategoryUsecase } from "../../application/product_management/category/create_category/Usecase.js"
import { runInTransaction, UnitOfWork } from "../../infra/utils/UnitOfWork.js"
import { knexInstance } from "../../config/Knex.js"
import { repositoryFactory } from "../../infra/utils/RepositoryFactory.js"
import { domainEventBus } from "../../infra/events/EventBusConfiguration.js"
import { idGenerator } from "../../infra/utils/IdGenerator.js"
import { IsolationLevel } from "../../core/interfaces/IUnitOfWork.js"
import { zValidator } from "@hono/zod-validator"
import z from "zod"
import { UpdateCategoryUsecase } from "../../application/product_management/category/update_category/Usecase.js"
import { ArchiveCategoryUsecase } from "../../application/product_management/category/archive_category/Usecase.js"
import { AddProductInCategoryUsecase } from "../../application/product_management/category/add_product_in_category/Usecase.js"
import { CategoryQueryDao } from "../../infra/db/query_dao/CategoryQueryDao.js"
import { includeStringSchema } from "../validation/IncludeStringSchema.js"

const app = new Hono()

app.get(
	"/",
	zValidator(
		"query",
		z
			.object({
				offset: z.coerce.number().positive(),
				limit: z.coerce.number().positive(),
				archived: z.coerce.boolean(),
				name: z.string().max(100).min(1),
				include: includeStringSchema(new Set("products")),
			})
			.partial(),
	),
	async (c) => {
		const queryDao = new CategoryQueryDao(knexInstance)
		const query = c.req.valid("query")
		let include = undefined
		if (query.include) {
			query.include
		}
		const result = await queryDao.query(
			{
				limit: query.limit,
				offset: query.offset,
			},
			{
				archived: query.archived,
				name: query.name,
			},
			include,
		)
		return c.json({ data: result })
	},
)

app.get(
	"/:categoryId",
	zValidator(
		"query",
		z
			.object({
				include: z.string().min(1),
				archived: z.coerce.boolean(),
			})
			.partial(),
	),
	zValidator(
		"param",
		z.object({
			categoryId: z.uuidv7(),
		}),
	),
	async (c) => {
		const queryDao = new CategoryQueryDao(knexInstance)
		const params = c.req.valid("param")

		const query = c.req.valid("query")
		let include = undefined
		if (query.include) {
			include = parseIncludeQueryString(query.include, ["products"])
		}
		const result = await queryDao.queryById(
			params.categoryId,
			query.archived,
			include,
		)
		return c.json({ data: result })
	},
)

app.post(
	"/",
	zValidator(
		"json",
		z.object({
			name: z.string().max(100).min(2),
			accountId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new CreateCategoryUsecase(
			uow,
			domainEventBus,
			idGenerator,
		)
		const body = c.req.valid("json")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({ accountId: body.accountId, name: body.name })
		})
		return c.json({ message: "Successfully created category" })
	},
)

app.patch(
	"/:categoryId",
	zValidator(
		"json",
		z.object({
			name: z.string().max(100).min(2),
		}),
	),
	zValidator(
		"param",
		z.object({
			categoryId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new UpdateCategoryUsecase(uow, domainEventBus)
		const body = c.req.valid("json")
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				categoryId: params.categoryId,
				name: body.name,
			})
		})
		return c.json({ message: "Successfully updated category" })
	},
)

app.delete(
	"/:categoryId",
	zValidator(
		"json",
		z.object({
			name: z.string().max(100).min(2),
		}),
	),
	zValidator(
		"param",
		z.object({
			categoryId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new ArchiveCategoryUsecase(uow, domainEventBus)
		const body = c.req.valid("json")
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({ categoryId: params.categoryId })
		})
		return c.json({ message: "Successfully archived category" })
	},
)

app.post(
	"/:categoryId/products",
	zValidator(
		"json",
		z.object({
			productId: z.uuidv7(),
		}),
	),
	zValidator(
		"param",
		z.object({
			categoryId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new AddProductInCategoryUsecase(uow, domainEventBus)
		const body = c.req.valid("json")
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				categoryId: params.categoryId,
				productId: body.productId,
			})
		})
		return c.json({ message: "Successfully added product to category" })
	},
)

app.post(
	"/:categoryId/products/:productId",
	zValidator(
		"param",
		z.object({
			categoryId: z.uuidv7(),
			productId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new AddProductInCategoryUsecase(uow, domainEventBus)
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				categoryId: params.categoryId,
				productId: params.productId,
			})
		})
		return c.json({ message: "Successfully removed product to category" })
	},
)
export default app
