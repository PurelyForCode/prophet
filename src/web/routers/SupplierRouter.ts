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
import { z } from "zod"
import { CreateSuppliedProductUsecase } from "../../application/delivery_management/supplier/supply_product/usecase.js"
import { RemoveSuppliedProductUsecase } from "../../application/delivery_management/supplier/remove_product/usecase.js"
import { UpdateSuppliedProductUsecase } from "../../application/delivery_management/supplier/update_supplied_product/usecase.js"
import { SupplierNotFoundException } from "../../domain/delivery_management/exceptions/SupplierNotFoundException.js"
import { authorize } from "../middleware/AuthorizeMiddleware.js"
import { DeleteSupplierUsecase } from "../../application/delivery_management/supplier/delete_supplier/Usecase.js"

const app = new Hono()

app.get("/count", async (c) => {
	const saleQueryDao = new SupplierQueryDao(knexInstance)
	const count = await saleQueryDao.count()
	return c.json({ data: count })
})

app.get(
	"/",
	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"query",
		z
			.object({
				name: z.string().min(1).max(100),
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
			{
				limit: query.limit,
				offset: query.offset,
			},
			{
				name: query.name,
				productId: query.productId,
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
	authorize(["MANAGE_PRODUCTS"]),
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
		if (!result) {
			throw new SupplierNotFoundException()
		}
		return c.json({
			data: result,
		})
	},
)

app.post(
	"/",
	authorize(["MANAGE_PRODUCTS"]),
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

app.patch(
	"/:supplierId",
	authorize(["MANAGE_PRODUCTS"]),
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

app.delete(
	"/:supplierId",
	zValidator(
		"param",
		z.object({
			supplierId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new DeleteSupplierUsecase(uow)
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({ supplierId: params.supplierId })
		})
		return c.json({
			message: "Successfully archived supplier",
		})
	},
)

app.post(
	"/:supplierId/products",
	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"param",
		z.object({
			supplierId: z.uuidv7(),
		}),
	),
	zValidator(
		"json",
		z.object({
			productId: z.uuidv7(),
			min: z.number().int().positive(),
			max: z.number().int().positive(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new CreateSuppliedProductUsecase(uow, idGenerator)
		const params = c.req.valid("param")
		const body = c.req.valid("json")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				max: body.max,
				min: body.min,
				productId: body.productId,
				supplierId: params.supplierId,
			})
		})
		c.status(201)
		return c.json({ message: "Successfully created a supplied product" })
	},
)

app.delete(
	"/:supplierId/products/:productId",
	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"param",
		z.object({
			supplierId: z.uuidv7(),
			productId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new RemoveSuppliedProductUsecase(uow)
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				productId: params.productId,
				supplierId: params.supplierId,
			})
		})
		c.status(200)
		return c.json({ message: "Successfully deleted a supplied product" })
	},
)

app.patch(
	"/:supplierId/products/:productId",
	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"param",
		z.object({
			supplierId: z.uuidv7(),
			productId: z.uuidv7(),
		}),
	),
	zValidator(
		"json",
		z
			.object({
				min: z.number().int().positive(),
				max: z.number().int().positive(),
				isDefault: z.boolean(),
			})
			.partial(),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new UpdateSuppliedProductUsecase(uow)
		const params = c.req.valid("param")
		const body = c.req.valid("json")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				fields: {
					max: body.max,
					min: body.min,
					isDefault: body.isDefault,
				},
				productId: params.productId,
				supplierId: params.supplierId,
			})
		})
		return c.json({ message: "Successfully updated a supplied product" })
	},
)

export default app
