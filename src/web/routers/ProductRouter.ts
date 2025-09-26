import { Hono } from "hono";
import { UnitOfWork } from "../../infra/utils/UnitOfWork.js";
import { repositoryFactory } from "../../infra/utils/RepositoryFactory.js";
import { knexInstance } from "../../config/Knex.js";
import { zValidator } from "@hono/zod-validator";
import * as z from "zod/v4";
import { idGenerator } from "../../infra/utils/IdGenerator.js";
import { productSettingSchema } from "../validation/ProductSettingSchema.js";
import { CreateProductUsecase } from "../../application/product_management/product/create_product/Usecase.js";
import { runInTransaction } from "../../infra/utils/UnitOfWork.js";
import { IsolationLevel } from "../../core/interfaces/IUnitOfWork.js";
import { fakeId } from "../../fakeId.js";
import { ArchiveProductUsecase } from "../../application/product_management/product/archive_product/Usecase.js";
import { UpdateProductUsecase } from "../../application/product_management/product/update_product/Usecase.js";
import saleRouter from "./SaleRouter.js";
import { domainEventBus } from "../../infra/events/EventBusConfiguration.js";
import { ProductQueryDao, ProductSortFields } from "../../infra/db/query_dao/ProductQueryDao.js";
import { parseIncludeQueryString } from "../utils/parseIncludeQueryString.js";
import { parseSortQueryString } from "../utils/parseSortQueryString.js";

const app = new Hono();

app.get("/",
	zValidator(
		"query",
		z.object({
			limit: z.coerce.number().int(),
			offset: z.coerce.number().int(),
			archived: z.coerce.boolean(),
			categoryId: z.uuidv7(),
			name: z.string().min(1).max(100),
			include: z.string().min(1),
			sort: z.string().min(1)
		}).partial()
	), async (c) => {
		const productQueryDao = new ProductQueryDao(knexInstance);

		const query = c.req.valid("query")
		let include = undefined
		let sort = undefined
		if (query.include) {
			include = parseIncludeQueryString(query.include, ["sales", "setting"])
		}
		if (query.sort) {
			sort = parseSortQueryString<ProductSortFields>(query.sort, ["name", "stock"])
		}
		const result = await productQueryDao.query(
			{
				limit: query.limit,
				offset: query.offset
			},
			{
				archived: query.archived,
				categoryId: query.categoryId,
				name: query.name
			},
			include,
			sort
		);
		return c.json({ data: result });
	}
);

app.get(
	"/:productId",
	zValidator(
		"param",
		z.object({
			productId: z.uuidv7(),
		})
	),
	zValidator(
		"query",
		z.object({
			include: z.string().min(1)
		}
		).partial()
	), async (c) => {
		const params = c.req.valid("param");
		const productQueryDao = new ProductQueryDao(knexInstance);
		const query = c.req.valid("query")
		let include = undefined
		if (query.include) {
			include = parseIncludeQueryString(query.include, ["sales", "setting"])
		}
		const result = await productQueryDao.queryById(
			params.productId,
			include
		);
		return c.json(result);
	}
);

app.post(
	"/",
	zValidator(
		"json",
		z.object({
			name: z.string().max(100).min(2),
			productCategoryId: z.uuidv7().nullish(),
			settings: productSettingSchema.nullish(),
		})
	),
	async (c) => {
		const body = c.req.valid("json");
		const uow = new UnitOfWork(knexInstance, repositoryFactory);
		const usecase = new CreateProductUsecase(uow, domainEventBus, idGenerator);
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				accountId: fakeId,
				name: body.name,
				productCategoryId: body.productCategoryId ?? null,
				settings: body.settings ?? undefined,
			});
		});
		c.status(201);
		return c.json({ message: "Successfully created product" });
	}
);

app.delete(
	"/:productId",

	zValidator(
		"param",
		z.object({
			productId: z.uuidv7(),
		})
	),
	async (c) => {
		const params = c.req.valid("param");
		const uow = new UnitOfWork(knexInstance, repositoryFactory);
		const usecase = new ArchiveProductUsecase(uow);
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({ productId: params.productId });
		});
		return c.json({ message: "Successfully archived product" });
	}
);
app.patch(
	"/:productId",
	zValidator(
		"param",
		z.object({
			productId: z.uuidv7(),
		})
	),
	zValidator(
		"json",
		z
			.object({
				name: z.string().max(100).min(2),
				safetyStock: z.number().int().min(0),
				stock: z.number().int().min(0),
				settings: productSettingSchema.partial(),
			})
			.partial()
	),
	async (c) => {
		const params = c.req.valid("param");
		const body = c.req.valid("json");
		const uow = new UnitOfWork(knexInstance, repositoryFactory);
		const usecase = new UpdateProductUsecase(uow);
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				productId: params.productId,
				fields: {
					name: body.name,
					safetyStock: body.safetyStock,
					stock: body.stock,
					settings: body.settings,
				},
			});
		});
		return c.json({ message: "Successfully updated product" });
	}
);

app.route("/:productId/sales", saleRouter);

export default app;
