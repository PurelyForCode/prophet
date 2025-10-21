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

const app = new Hono()

app.get(
	"/",
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
				date: z.coerce.date(),
				summed: booleanStringSchema,
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
				archived: query.archived,
				date: query.date,
				summed: query.summed,
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
		}),
	),
	async (c) => {
		const params = c.req.valid("param")
		const saleQueryDto = new SaleQueryDao(knexInstance)
		const sales = await saleQueryDto.queryById(params.saleId, undefined)

		return c.json({ data: sales })
	},
)

export default app
