import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { runInTransaction, UnitOfWork } from "../../infra/utils/UnitOfWork.js"
import { knexInstance } from "../../config/Knex.js"
import { repositoryFactory } from "../../infra/utils/RepositoryFactory.js"
import { EventBus } from "../../infra/events/DomainEventBus.js"
import { CreateSupplierUsecase } from "../../application/delivery_management/supplier/create_supplier/Usecase.js"
import { idGenerator } from "../../infra/utils/IdGenerator.js"
import { IsolationLevel } from "../../core/interfaces/IUnitOfWork.js"
import { fakeId } from "../../fakeId.js"
import { UpdateSupplierUsecase } from "../../application/delivery_management/supplier/update_supplier/Usecase.js"
import {
	SupplierIncludeFields,
	SupplierQueryDao,
	SupplierSortableFields,
} from "../../infra/db/query_dao/SupplierQueryDao.js"
import { includeStringSchema } from "../validation/IncludeStringSchema.js"
import { sortStringSchema } from "../validation/SortStringSchema.js"
import { boolean, z } from "zod"
import { booleanStringSchema } from "../validation/BooleanStringSchema.js"

const app = new Hono()

app.get(
	"/",
	zValidator(
		"query",
		z
			.object({
				name: z.string().min(1).max(100),
				archived: booleanStringSchema,
				offset: z.coerce.number().int().nonnegative(),
				limit: z.coerce.number().int().positive(),
				productId: z.uuidv7(),
				sort: sortStringSchema(
					new Set<SupplierSortableFields>(["leadTime"]),
				),
				include: includeStringSchema(
					new Set<SupplierIncludeFields>(["products"]),
				),
			})
			.partial(),
	),

	async (c) => {
		const supplierQueryDao = new SupplierQueryDao(knexInstance)
		const query = c.req.valid("query")
		const result = await supplierQueryDao.query(
			{ limit: query.limit, offset: query.offset },
			{
				name: query.name,
				productId: query.productId,
				archived: query.archived,
			},
			query.sort,
			query.include,
		)
		return c.json({
			data: result,
		})
	},
)

app.get(
	"/:supplierId",
	zValidator(
		"param",
		z.object({
			supplierId: z.uuidv7(),
		}),
	),
	zValidator(
		"query",
		z
			.object({
				include: includeStringSchema(
					new Set<SupplierIncludeFields>(["products"]),
				),
			})
			.partial(),
	),
	async (c) => {
		const supplierQueryDao = new SupplierQueryDao(knexInstance)
		const query = c.req.valid("query")
		const params = c.req.valid("param")
		const result = await supplierQueryDao.queryById(
			params.supplierId,
			query.include,
		)
		return c.json({
			data: result,
		})
	},
)

app.post(
	"/",
	zValidator(
		"json",
		z.object({
			leadTime: z.number().int().positive(),
			name: z.string().max(100).min(1),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const eventBus = new EventBus()
		const usecase = new CreateSupplierUsecase(uow, eventBus, idGenerator)
		const body = c.req.valid("json")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				accountId: fakeId,
				leadTime: body.leadTime,
				name: body.name,
			})
		})
		c.status(201)
		return c.json({
			message: "Successfully created supplier",
		})
	},
)

app.post(
	"/:supplierId",
	zValidator(
		"param",
		z.object({
			supplierId: z.uuidv7(),
		}),
	),
	zValidator(
		"json",
		z
			.object({
				leadTime: z.number().int().positive(),
				name: z.string().max(100).min(1),
			})
			.partial(),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const eventBus = new EventBus()
		const usecase = new UpdateSupplierUsecase(uow, eventBus)
		const params = c.req.valid("param")
		const body = c.req.valid("json")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				fields: body,
				supplierId: params.supplierId,
			})
		})
		c.status(201)
		return c.json({
			message: "Successfully updated supplier",
		})
	},
)

export default app
