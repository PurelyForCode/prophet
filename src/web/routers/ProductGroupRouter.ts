import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { z } from "zod"
import { runInTransaction, UnitOfWork } from "../../infra/utils/UnitOfWork.js"
import { UpdateProductGroupUsecase } from "../../application/product_management/product_group/update_product_group/usecase.js"
import { knexInstance } from "../../config/Knex.js"
import { repositoryFactory } from "../../infra/utils/RepositoryFactory.js"
import { IsolationLevel } from "../../core/interfaces/IUnitOfWork.js"
import { productSettingSchema } from "../validation/ProductSettingSchema.js"
import { sortStringSchema } from "../validation/SortStringSchema.js"
import {
	ProductGroupIncludeFields,
	ProductGroupQueryDao,
	ProductGroupSortableFields,
} from "../../infra/db/query_dao/ProductGroupQueryDao.js"
import { includeStringSchema } from "../validation/IncludeStringSchema.js"
import { ProductGroupNotFoundException } from "../../domain/product_management/exceptions/ProductGroupNotFoundException.js"
import { CreateProductGroupUsecase } from "../../application/product_management/product_group/create_product_group/usecase.js"
import { idGenerator } from "../../infra/utils/IdGenerator.js"
import { fakeId } from "../../fakeId.js"
import { ArchiveProductGroupUsecase } from "../../application/product_management/product_group/archive_product_group/usecase.js"
import productRouter from "./ProductRouter.js"
import { CategoryQueryDao } from "../../infra/db/query_dao/CategoryQueryDao.js"
import { CategoryNotFoundException } from "../../domain/product_management/exceptions/CategoryNotFoundException.js"
import { authorize } from "../middleware/AuthorizeMiddleware.js"

const app = new Hono()

app.get("/count", async (c) => {
	const productGroupQueryDao = new ProductGroupQueryDao(knexInstance)
	const count = await productGroupQueryDao.count()
	return c.json({ data: count })
})

app.get(
	"/",
	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"query",
		z
			.object({
				sort: sortStringSchema(
					new Set<ProductGroupSortableFields>(["name", "createdAt"]),
				),
				include: includeStringSchema(
					new Set<ProductGroupIncludeFields>([
						"productSettings",
						"productSales",
					]),
				),
				limit: z.coerce.number().int().positive(),
				offset: z.coerce.number().int().nonnegative(),
				name: z.string().min(1).max(100),
				categoryId: z.uuidv7(),
			})
			.partial(),
	),
	async (c) => {
		const groupQueryDao = new ProductGroupQueryDao(knexInstance)
		const query = c.req.valid("query")
		if (query.categoryId) {
			const categoryQueryDao = new CategoryQueryDao(knexInstance)
			const exists = await categoryQueryDao.exists(query.categoryId)
			if (!exists) {
				throw new CategoryNotFoundException()
			}
		}
		const groups = await groupQueryDao.query(
			{ limit: query.limit, offset: query.offset },
			{
				categoryId: query.categoryId,
				name: query.name,
			},
			query.include,
			query.sort ?? undefined,
		)
		return c.json({ data: groups })
	},
)

app.get(
	"/:groupId",
	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"query",
		z
			.object({
				include: includeStringSchema(
					new Set<ProductGroupIncludeFields>([
						"productSettings",
						"productSales",
					]),
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
		const groupQueryDao = new ProductGroupQueryDao(knexInstance)
		const query = c.req.valid("query")
		const params = c.req.valid("param")
		const group = await groupQueryDao.queryById(
			params.groupId,
			query.include,
		)
		if (!group) {
			throw new ProductGroupNotFoundException()
		}
		return c.json({ data: group })
	},
)

app.post(
	"/",

	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"json",
		z.object({
			categoryId: z.uuidv7().nullish(),
			name: z.string().min(1).max(100),
			productSettings: productSettingSchema.nullish(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new CreateProductGroupUsecase(uow, idGenerator)
		const body = c.req.valid("json")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				accountId: fakeId,
				categoryId: body.categoryId ?? null,
				name: body.name,
				setting: body.productSettings ?? null,
			})
		})
		c.status(201)
		return c.json({
			message: "Product group successfully created",
		})
	},
)

app.delete(
	"/:groupId",

	authorize(["MANAGE_PRODUCTS"]),
	zValidator("param", z.object({ groupId: z.uuidv7() })),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new ArchiveProductGroupUsecase(uow)
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				id: params.groupId,
			})
		})
		c.status(200)
		return c.json({
			message: "Product group successfully archived",
		})
	},
)

app.patch(
	"/:groupId",
	authorize(["MANAGE_PRODUCTS"]),
	zValidator("param", z.object({ groupId: z.uuidv7() })),
	zValidator(
		"json",
		z
			.object({
				name: z.string().min(1).max(100),
			})
			.partial(),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new UpdateProductGroupUsecase(uow)
		const body = c.req.valid("json")
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				id: params.groupId,
				fields: {
					name: body.name,
				},
			})
		})
		return c.json({
			message: "Product group successfully updated",
		})
	},
)

app.route("/:groupId/products", productRouter)

export default app
