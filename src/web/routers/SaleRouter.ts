import { Hono } from "hono"
import { CreateSaleUsecase } from "../../application/sales_management/create_sale/Usecase.js"
import { runInTransaction, UnitOfWork } from "../../infra/utils/UnitOfWork.js"
import { idGenerator } from "../../infra/utils/IdGenerator.js"
import { knexInstance } from "../../config/Knex.js"
import { repositoryFactory } from "../../infra/utils/RepositoryFactory.js"
import { IsolationLevel } from "../../core/interfaces/IUnitOfWork.js"
import { zValidator } from "@hono/zod-validator"
import z from "zod"
import { fakeId } from "../../fakeId.js"
import { UpdateSaleUsecase } from "../../application/sales_management/update_sale/Usecase.js"
import { ArchiveSaleUsecase } from "../../application/sales_management/archive_sale/Usecase.js"
import {
	SaleQueryDao,
	SaleSortableField,
} from "../../infra/db/query_dao/SaleQueryDao.js"
import { sortStringSchema } from "../validation/SortStringSchema.js"
import { booleanStringSchema } from "../validation/BooleanStringSchema.js"
import { SaleNotFoundException } from "../../domain/sales/exceptions/SaleNotFoundException.js"
import { ProductGroupQueryDao } from "../../infra/db/query_dao/ProductGroupQueryDao.js"
import { ProductQueryDao } from "../../infra/db/query_dao/ProductQueryDao.js"
import { ProductGroupNotFoundException } from "../../domain/product_management/exceptions/ProductGroupNotFoundException.js"
import { ProductNotFoundException } from "../../domain/product_management/exceptions/ProductNotFoundException.js"

const app = new Hono()

app.get(
	"/",
	zValidator(
		"param",
		z.object({
			productId: z.uuidv7(),
			groupId: z.uuidv7(),
		}),
	),
	zValidator(
		"query",
		z
			.object({
				offset: z.coerce.number().int().nonnegative(),
				limit: z.coerce.number().int().positive(),
				archived: booleanStringSchema,
				sort: sortStringSchema(
					new Set<SaleSortableField>(["quantity", "status", "date"]),
				),
			})
			.partial(),
	),
	async (c) => {
		const query = c.req.valid("query")
		const params = c.req.valid("param")
		const groupQueryDao = new ProductGroupQueryDao(knexInstance)
		const productQueryDao = new ProductQueryDao(knexInstance)

		const groupExists = await groupQueryDao.exists(params.groupId)
		if (!groupExists) {
			throw new ProductGroupNotFoundException()
		}
		const productExists = await productQueryDao.exists(params.productId)
		if (!productExists) {
			throw new ProductNotFoundException()
		}

		const saleQueryDto = new SaleQueryDao(knexInstance)
		const sales = await saleQueryDto.query(
			{
				offset: query.offset,
				limit: query.limit,
			},
			{
				archived: query.archived,
				productId: params.productId,
			},
			query.sort,
		)

		return c.json({ data: sales })
	},
)

app.get(
	"/:saleId",
	zValidator(
		"param",
		z.object({
			saleId: z.uuidv7(),
			productId: z.uuidv7(),
			groupId: z.uuidv7(),
		}),
	),
	async (c) => {
		const params = c.req.valid("param")
		const groupQueryDao = new ProductGroupQueryDao(knexInstance)
		const productQueryDao = new ProductQueryDao(knexInstance)

		const groupExists = await groupQueryDao.exists(params.groupId)
		if (!groupExists) {
			throw new ProductGroupNotFoundException()
		}
		const productExists = await productQueryDao.exists(params.productId)
		if (!productExists) {
			throw new ProductNotFoundException()
		}

		const saleQueryDto = new SaleQueryDao(knexInstance)
		const sales = await saleQueryDto.queryById(params.saleId, {
			productId: params.productId,
		})
		if (!sales) {
			throw new SaleNotFoundException()
		}
		return c.json({ data: sales })
	},
)

app.post(
	"/",
	zValidator(
		"json",
		z.object({
			date: z.coerce.date(),
			quantity: z.number().int().min(1),
			status: z.enum(["completed", "in progress", "cancelled"]),
		}),
	),
	zValidator(
		"param",
		z.object({
			productId: z.uuidv7(),
			groupId: z.uuidv7(),
		}),
	),
	async (c) => {
		const params = c.req.valid("param")
		const body = c.req.valid("json")
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new CreateSaleUsecase(uow, idGenerator)
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				accountId: fakeId,
				groupId: params.groupId,
				date: body.date,
				productId: params.productId,
				quantity: body.quantity,
				status: body.status,
			})
		})
		return c.json({ message: "Successfully created sale" })
	},
)
app.delete(
	"/:saleId",
	zValidator(
		"param",
		z.object({
			saleId: z.uuidv7(),
			productId: z.uuidv7(),
			groupId: z.uuidv7(),
		}),
	),

	async (c) => {
		const params = c.req.valid("param")
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new ArchiveSaleUsecase(uow)
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				saleId: params.saleId,
				productId: params.productId,
				groupId: params.groupId,
			})
		})
		return c.json({ message: "Successfully deleted sale" })
	},
)
app.patch(
	"/:saleId",
	zValidator(
		"json",
		z
			.object({
				date: z.coerce.date(),
				quantity: z.number().int().min(1),
				status: z.enum(["completed", "in progress", "cancelled"]),
			})
			.partial(),
	),
	zValidator(
		"param",
		z.object({
			saleId: z.uuidv7(),
			productId: z.uuidv7(),
			groupId: z.uuidv7(),
		}),
	),
	async (c) => {
		const params = c.req.valid("param")
		const body = c.req.valid("json")
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new UpdateSaleUsecase(uow)
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				saleId: params.saleId,
				productId: params.productId,
				groupId: params.groupId,
				fields: {
					date: body.date,
					quantity: body.quantity,
					status: body.status,
				},
			})
		})
		return c.json({ message: "Successfully updated sale" })
	},
)

export default app
