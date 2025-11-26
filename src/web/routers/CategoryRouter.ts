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
import {
	CategoryIncludeField,
	CategoryQueryDao,
	CategorySortableFields,
} from "../../infra/db/query_dao/CategoryQueryDao.js"
import { includeStringSchema } from "../validation/IncludeStringSchema.js"
import { sortStringSchema } from "../validation/SortStringSchema.js"
import { CategoryNotFoundException } from "../../domain/product_management/exceptions/CategoryNotFoundException.js"
import { fakeId } from "../../fakeId.js"
import { RemoveProductInCategoryUsecase } from "../../application/product_management/category/remove_product/Usecase.js"
import { authorize } from "../middleware/AuthorizeMiddleware.js"

const app = new Hono()

app.get(
	"/",

	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"query",
		z
			.object({
				offset: z.coerce.number().nonnegative(),
				limit: z.coerce.number().positive(),
				name: z.string().max(100).min(1),
				include: includeStringSchema(
					new Set<CategoryIncludeField>(["groups"]),
				),
				sort: sortStringSchema(
					new Set<CategorySortableFields>(["name"]),
				),
			})
			.partial(),
	),
	async (c) => {
		const queryDao = new CategoryQueryDao(knexInstance)
		const query = c.req.valid("query")
		const result = await queryDao.query(
			{
				limit: query.limit,
				offset: query.offset,
			},
			{
				name: query.name,
			},
			query.include,
			query.sort,
		)
		return c.json({ data: result })
	},
)

app.get(
	"/:categoryId",
	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"query",
		z
			.object({
				include: includeStringSchema(
					new Set<CategoryIncludeField>(["groups"]),
				),
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
		const result = await queryDao.queryById(
			params.categoryId,
			query.include,
		)
		if (!result) {
			throw new CategoryNotFoundException()
		}
		return c.json({ data: result })
	},
)

app.post(
	"/",
	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"json",
		z.object({
			name: z.string().max(100).min(2),
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
			await usecase.call({ accountId: fakeId, name: body.name })
		})
		return c.json({ message: "Successfully created category" })
	},
)

app.patch(
	"/:categoryId",
	authorize(["MANAGE_PRODUCTS"]),
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
	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"param",
		z.object({
			categoryId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new ArchiveCategoryUsecase(uow, domainEventBus)
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({ categoryId: params.categoryId })
		})
		return c.json({ message: "Successfully archived category" })
	},
)

app.post(
	"/:categoryId/groups",
	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"json",
		z.object({
			groupId: z.uuidv7(),
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
				groupId: body.groupId,
			})
		})
		return c.json({ message: "Successfully added product to category" })
	},
)

app.delete(
	"/:categoryId/groups/:groupId",
	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"param",
		z.object({
			categoryId: z.uuidv7(),
			groupId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new RemoveProductInCategoryUsecase(uow, domainEventBus)
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				categoryId: params.categoryId,
				groupId: params.groupId,
			})
		})
		return c.json({ message: "Successfully removed product to category" })
	},
)

export default app
