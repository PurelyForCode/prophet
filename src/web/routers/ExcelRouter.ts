import { Hono } from "hono"
import { knexInstance } from "../../config/Knex.js"
import { UnitOfWork } from "../../infra/utils/UnitOfWork.js"
import { repositoryFactory } from "../../infra/utils/RepositoryFactory.js"
import { idGenerator } from "../../infra/utils/IdGenerator.js"
import { domainEventBus } from "../../infra/events/EventBusConfiguration.js"
import { ExportProductsTemplateUsecase } from "../../application/excel/export_products_template/Usecase.js"
import { ExportSalesTemplateUsecase } from "../../application/excel/export_sales_template/Usecase.js"
import { ImportProductsUsecase } from "../../application/excel/import_products/Usecase.js"
import { ImportSalesUsecase } from "../../application/excel/import_sales/Usecase.js"
import { fakeId } from "../../fakeId.js"
import { zValidator } from "@hono/zod-validator"
import z from "zod"
import { booleanStringSchema } from "../validation/BooleanStringSchema.js"

const app = new Hono()

app.get("/products/export", async (c) => {
	const includeArchived = c.req.query("include_archived") === "true"
	const usecase = new ExportProductsTemplateUsecase(knexInstance)
	const buffer = await usecase.call({ includeArchived })

	const filename = `products_${new Date().toISOString().split("T")[0]}.xlsx`

	c.header(
		"Content-Type",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	)
	c.header("Content-Disposition", `attachment; filename="${filename}"`)

	return c.body(buffer)
})

app.get("/sales/export",
	zValidator("query", z.object({
		dateRangeStart: z.coerce.date(),
		dateRangeEnd: z.coerce.date(),
		archived: booleanStringSchema,
	}).partial()),
	async (c) => {
		const usecase = new ExportSalesTemplateUsecase(knexInstance)
		const query = c.req.valid("query")
		const buffer = await usecase.call({
			includeArchived: query.archived,
			dateRangeEnd: query.dateRangeEnd,
			dateRangeStart: query.dateRangeStart
		})

		if (!buffer) {
			return c.json({ message: "No sales found in range" })
		}

		const filename = `sales_${new Date().toISOString().split("T")[0]}.xlsx`

		c.header(
			"Content-Type",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		)
		c.header("Content-Disposition", `attachment; filename="${filename}"`)

		return c.body(buffer)
	})

app.post("/products/import", async (c) => {
	const accountId = fakeId

	const body = await c.req.parseBody()
	const file = body["file"]

	if (!file || !(file instanceof File)) {
		return c.json({ error: "No file uploaded" }, 400)
	}

	const buffer = Buffer.from(await file.arrayBuffer())

	const uow = new UnitOfWork(knexInstance, repositoryFactory)
	const usecase = new ImportProductsUsecase(
		knexInstance,
		uow,
		idGenerator,
		domainEventBus,
	)

	const result = await usecase.call({
		fileBuffer: buffer,
		accountId,
	})

	return c.json(result)
})

app.post("/sales/import", async (c) => {
	const accountId = fakeId

	const body = await c.req.parseBody()
	const file = body["file"]

	if (!file || !(file instanceof File)) {
		return c.json({ error: "No file uploaded" }, 400)
	}

	const buffer = Buffer.from(await file.arrayBuffer())

	const uow = new UnitOfWork(knexInstance, repositoryFactory)
	const usecase = new ImportSalesUsecase(
		knexInstance,
		uow,
		idGenerator,
		domainEventBus,
	)

	const result = await usecase.call({
		fileBuffer: buffer,
		accountId,
	})

	return c.json(result)
})

export default app

