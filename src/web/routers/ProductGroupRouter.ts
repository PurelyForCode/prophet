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
	ProductGroupQueryInclude,
	ProductGroupSortableFields,
} from "../../infra/db/query_dao/ProductGroupQueryDao.js"
import { includeStringSchema } from "../validation/IncludeStringSchema.js"
import { Sort } from "../../infra/db/utils/Sort.js"
import { ProductGroupNotFoundException } from "../../domain/product_management/exceptions/ProductGroupNotFoundException.js"
import { CreateProductGroupUsecase } from "../../application/product_management/product_group/create_product_group/usecase.js"
import { idGenerator } from "../../infra/utils/IdGenerator.js"
import { fakeId } from "../../fakeId.js"
import { ArchiveProductGroupUsecase } from "../../application/product_management/product_group/archive_product_group/usecase.js"
import { ProductSortableFields } from "../../infra/db/query_dao/ProductQueryDao.js"

const app = new Hono()

app.get(
	"/",
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
				offset: z.coerce.number().int().positive(),
				name: z.string().min(1).max(100),
				archived: z.coerce.boolean(),
				categoryId: z.uuidv7(),
			})
			.partial(),
	),
	async (c) => {
		const groupQueryDao = new ProductGroupQueryDao(knexInstance)
		const query = c.req.valid("query")
		const groups = await groupQueryDao.query(
			{ limit: query.limit, offset: query.offset },
			{
				archived: query.archived,
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
	zValidator(
		"json",
		z.object({
			categoryId: z.uuidv7().nullish(),
			name: z.string().min(1).max(100),
			settings: productSettingSchema.nullish(),
		}),
	),
	(c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new CreateProductGroupUsecase(uow, idGenerator)
		const body = c.req.valid("json")
		runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				accountId: fakeId,
				categoryId: body.categoryId ?? null,
				name: body.name,
				setting: body.settings ?? null,
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
	zValidator("param", z.object({ groupId: z.uuidv7() })),
	(c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new ArchiveProductGroupUsecase(uow)
		const params = c.req.valid("param")
		runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
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
	zValidator("param", z.object({ groupId: z.uuidv7() })),
	zValidator("json", z.object({}).partial()),
	(c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new UpdateProductGroupUsecase(uow)
		const body = c.req.valid("json")
		const params = c.req.valid("param")
		runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
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

export default app
