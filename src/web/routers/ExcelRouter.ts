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

const app = new Hono()

app.get("/products/export", async (c) => {
	const includeArchived = c.req.query("include_archived") === "true"
	const uow = new UnitOfWork(knexInstance, repositoryFactory)

	const usecase = new ExportProductsTemplateUsecase(knexInstance, uow)
	const buffer = await usecase.call({ includeArchived })

	const filename = `products_${new Date().toISOString().split("T")[0]}.xlsx`

	c.header(
		"Content-Type",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	)
	c.header("Content-Disposition", `attachment; filename="${filename}"`)

	return c.body(buffer)
})

app.get("/sales/export", async (c) => {
	const productId = c.req.query("product_id")
	const includeArchived = c.req.query("include_archived") === "true"
	const uow = new UnitOfWork(knexInstance, repositoryFactory)

	const usecase = new ExportSalesTemplateUsecase(knexInstance, uow)
	const buffer = await usecase.call({
		productId: productId || undefined,
		includeArchived,
	})

	const filename = `sales_${new Date().toISOString().split("T")[0]}.xlsx`

	c.header(
		"Content-Type",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	)
	c.header("Content-Disposition", `attachment; filename="${filename}"`)

	return c.body(buffer)
})

app.post("/products/import", async (c) => {
	// Get account ID from session or request
	// For now, using a default account ID - should be from session in production
	const accountId = c.req.header("X-Account-Id") || "test-account-id"

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
	// Get account ID from session or request
	const accountId = c.req.header("X-Account-Id") || "test-account-id"

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

