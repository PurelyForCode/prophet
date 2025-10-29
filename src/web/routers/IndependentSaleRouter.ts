import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import z from "zod"
import { booleanStringSchema } from "../validation/BooleanStringSchema.js"
import { sortStringSchema } from "../validation/SortStringSchema.js"
import {
	SaleQueryDao,
	SaleSortableField,
} from "../../infra/db/query_dao/SaleQueryDao.js"
import { knexInstance } from "../../config/Knex.js"
import { SaleNotFoundException } from "../../domain/sales/exceptions/SaleNotFoundException.js"
import { authorize } from "../middleware/AuthorizeMiddleware.js"
import { SaleStatusValues } from "../../domain/sales/entities/sale/value_objects/SaleStatus.js"

const app = new Hono()

app.get("/count", async (c) => {
	const saleQueryDao = new SaleQueryDao(knexInstance)
	const count = await saleQueryDao.count()
	return c.json({ data: count })
})

app.get(
	"/",
	authorize(["MANAGE_SALES"]),
	zValidator(
		"query",
		z
			.object({
				offset: z.coerce.number().int().nonnegative(),
				limit: z.coerce.number().int().positive(),
				sort: sortStringSchema(
					new Set<SaleSortableField>(["quantity", "status", "date"]),
				),
				date: z.coerce.date(),
				summed: booleanStringSchema,
				status: z.enum<SaleStatusValues[]>([
					"completed",
					"pending",
					"cancelled",
				]),
			})
			.partial(),
	),
	async (c) => {
		const query = c.req.valid("query")
		const saleQueryDto = new SaleQueryDao(knexInstance)
		const sales = await saleQueryDto.query(
			{
				offset: query.offset,
				limit: query.limit,
			},
			{
				date: query.date,
				summed: query.summed,
				status: query.status,
			},
			query.sort,
		)

		return c.json({ data: sales })
	},
)

app.get(
	"/:saleId",
	authorize(["MANAGE_SALES"]),
	zValidator(
		"param",
		z.object({
			saleId: z.uuidv7(),
		}),
	),

	zValidator(
		"query",
		z
			.object({
				summed: booleanStringSchema,
			})
			.partial(),
	),
	async (c) => {
		const params = c.req.valid("param")
		const query = c.req.valid("query")
		const saleQueryDto = new SaleQueryDao(knexInstance)
		const sales = await saleQueryDto.queryById(params.saleId, {
			summed: query.summed,
		})
		if (!sales) {
			throw new SaleNotFoundException()
		}

		return c.json({ data: sales })
	},
)

export default app
