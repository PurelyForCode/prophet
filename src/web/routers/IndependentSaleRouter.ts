import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import z from "zod"
import { booleanStringSchema } from "../validation/BooleanStringSchema.js"
import { sortStringSchema } from "../validation/SortStringSchema.js"
import {
	SaleQueryDao,
	SaleSortableField,
} from "../../infra/db/query_dao/SaleQueryDao.js"
import { ProductGroupQueryDao } from "../../infra/db/query_dao/ProductGroupQueryDao.js"
import { ProductQueryDao } from "../../infra/db/query_dao/ProductQueryDao.js"
import { knexInstance } from "../../config/Knex.js"

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
		const saleQueryDto = new SaleQueryDao(knexInstance)
		const sales = await saleQueryDto.query(
			{
				offset: query.offset,
				limit: query.limit,
			},
			{
				archived: query.archived,
			},
			query.sort,
		)

		return c.json({ data: sales })
	},
)
