import { Hono } from "hono"
import { UnitOfWork } from "../../infra/utils/UnitOfWork.js"
import { repositoryFactory } from "../../infra/utils/RepositoryFactory.js"
import { knexInstance } from "../../config/Knex.js"
import { zValidator } from "@hono/zod-validator"
import * as z from "zod/v4"
import { idGenerator } from "../../infra/utils/IdGenerator.js"
import { productSettingSchema } from "../validation/ProductSettingSchema.js"
import { CreateProductUsecase } from "../../application/product_management/product/create_product/Usecase.js"
import { runInTransaction } from "../../infra/utils/UnitOfWork.js"
import { IsolationLevel } from "../../core/interfaces/IUnitOfWork.js"
import { fakeId } from "../../fakeId.js"
import { ArchiveProductUsecase } from "../../application/product_management/product/archive_product/Usecase.js"
import { UpdateProductUsecase } from "../../application/product_management/product/update_product/Usecase.js"
import saleRouter from "./SaleRouter.js"
import { domainEventBus } from "../../infra/events/EventBusConfiguration.js"
import {
	ProductIncludeField,
	ProductQueryDao,
	ProductSortableFields,
} from "../../infra/db/query_dao/ProductQueryDao.js"
import { sortStringSchema } from "../validation/SortStringSchema.js"
import { includeStringSchema } from "../validation/IncludeStringSchema.js"
import { ProductNotFoundException } from "../../domain/product_management/exceptions/ProductNotFoundException.js"
import { ProductGroupQueryDao } from "../../infra/db/query_dao/ProductGroupQueryDao.js"
import { ProductGroupNotFoundException } from "../../domain/product_management/exceptions/ProductGroupNotFoundException.js"
import forecastRouter from "./ForecastRouter.js"
import { authorize } from "../middleware/AuthorizeMiddleware.js"

const app = new Hono()

app.get(
	"/",
	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"query",
		z
			.object({
				limit: z.coerce.number().int().positive(),
				offset: z.coerce.number().int().nonnegative(),
				name: z.string().min(1).max(100),
				include: includeStringSchema(
					new Set<ProductIncludeField>(["sales", "settings"]),
				),
				sort: sortStringSchema(
					new Set<ProductSortableFields>(["name", "stock"]),
				),
			})
			.partial(),
	),
	zValidator(
		"param",
		z.object({
			groupId: z.uuidv7(),
		}),
	),
	async (c) => {
		const params = c.req.valid("param")
		const query = c.req.valid("query")

		const productQueryDao = new ProductQueryDao(knexInstance)
		const groupQueryDao = new ProductGroupQueryDao(knexInstance)
		const groupExists = await groupQueryDao.exists(params.groupId)
		if (!groupExists) {
			throw new ProductGroupNotFoundException()
		}

		const result = await productQueryDao.query(
			{
				limit: query.limit,
				offset: query.offset,
			},
			{
				groupId: params.groupId,
				name: query.name,
			},
			query.include,
			query.sort,
		)
		return c.json({ data: result })
	},
)

app.get(
	"/:productId",

	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"param",
		z.object({
			groupId: z.uuidv7(),
			productId: z.uuidv7(),
		}),
	),
	zValidator(
		"query",
		z
			.object({
				include: includeStringSchema(
					new Set<ProductIncludeField>(["sales", "settings"]),
				),
			})
			.partial(),
	),
	async (c) => {
		const params = c.req.valid("param")
		const query = c.req.valid("query")

		const productQueryDao = new ProductQueryDao(knexInstance)
		const groupQueryDao = new ProductGroupQueryDao(knexInstance)
		const groupExists = await groupQueryDao.exists(params.groupId)
		if (!groupExists) {
			throw new ProductGroupNotFoundException()
		}
		const result = await productQueryDao.queryOneFromGroupIdById(
			params.productId,
			params.groupId,
			query.include,
		)
		if (!result) {
			throw new ProductNotFoundException()
		}
		return c.json(result)
	},
)

app.post(
	"/",

	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"json",
		z.object({
			name: z.string().max(100).min(2),
			settings: productSettingSchema.nullish(),
		}),
	),
	zValidator(
		"param",
		z.object({
			groupId: z.uuidv7(),
		}),
	),
	async (c) => {
		const body = c.req.valid("json")
		const params = c.req.valid("param")
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new CreateProductUsecase(
			uow,
			domainEventBus,
			idGenerator,
		)
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				accountId: fakeId,
				name: body.name,
				settings: body.settings ?? undefined,
				groupId: params.groupId,
			})
		})
		c.status(201)
		return c.json({ message: "Successfully created product" })
	},
)

app.delete(
	"/:productId",

	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"param",
		z.object({
			productId: z.uuidv7(),
			groupId: z.uuidv7(),
		}),
	),
	async (c) => {
		const params = c.req.valid("param")
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new ArchiveProductUsecase(uow)
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				groupId: params.groupId,
				productId: params.productId,
			})
		})
		return c.json({ message: "Successfully archived product" })
	},
)
app.patch(
	"/:productId",

	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"param",
		z.object({
			productId: z.uuidv7(),
			groupId: z.uuidv7(),
		}),
	),
	zValidator(
		"json",
		z
			.object({
				name: z.string().max(100).min(2),
				safetyStock: z.number().int().min(0),
				stock: z.number().int().min(0),
				settings: productSettingSchema.partial(),
			})
			.partial(),
	),
	async (c) => {
		const params = c.req.valid("param")
		const body = c.req.valid("json")
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new UpdateProductUsecase(uow)
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				groupId: params.groupId,
				productId: params.productId,
				fields: {
					name: body.name,
					safetyStock: body.safetyStock,
					settings: body.settings,
					stock: body.stock,
				},
			})
		})
		return c.json({ message: "Successfully updated product" })
	},
)

app.post(
	"/:productId/unarchive",
	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"json",
		z.object({
			newName: z.string().max(100).min(1).nullish(),
		}),
	),
	(c) => {
		return c.json({})
	},
)

app.route("/:productId/sales", saleRouter)
app.route("/:productId/forecasts", forecastRouter)

export default app
