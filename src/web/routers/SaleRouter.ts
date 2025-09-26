import { Hono } from "hono";
import { CreateSaleUsecase } from "../../application/sales_management/create_sale/Usecase.js";
import { runInTransaction, UnitOfWork } from "../../infra/utils/UnitOfWork.js";
import { idGenerator } from "../../infra/utils/IdGenerator.js";
import { knexInstance } from "../../config/Knex.js";
import { repositoryFactory } from "../../infra/utils/RepositoryFactory.js";
import { IsolationLevel } from "../../core/interfaces/IUnitOfWork.js";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { fakeId } from "../../fakeId.js";
import { UpdateSaleUsecase } from "../../application/sales_management/update_sale/Usecase.js";
import { ArchiveSaleUsecase } from "../../application/sales_management/archive_sale/Usecase.js";
import { SaleQueryDao, SaleSortFields } from "../../infra/db/query_dao/SaleQueryDao.js";
import { parseSortQueryString } from "../utils/parseSortQueryString.js";

const app = new Hono();

app.get(
	"/",
	zValidator(
		"param",
		z.object({
			productId: z.uuidv7(),
			variantId: z.uuidv7().optional(),
		})
	),
	zValidator("query", z.object({
		offset: z.coerce.number().int().positive(),
		limit: z.coerce.number().int().positive(),
		archived: z.coerce.boolean(),
		productId: z.uuidv7(),
		sort: z.string().min(1),
	}))
	,
	async (c) => {
		const params = c.req.valid("param");
		const query = c.req.valid("query")
		let sort = undefined
		if (query.sort) {
			sort = parseSortQueryString<SaleSortFields>(query.sort, ["quantity", "date", "status"])
		}

		const saleQueryDto = new SaleQueryDao(knexInstance);
		const sales = await saleQueryDto.query(
			{
				offset: query.offset,
				limit: query.limit
			},
			{
				archived: query.archived,
				productId: query.productId
			},
			sort
		);
		return c.json({ data: sales });
	}
);
app.get(
	"/:saleId",
	zValidator(
		"param",
		z.object({
			saleId: z.uuidv7(),
			productId: z.uuidv7(),
		})
	),
	zValidator("query", z.object({
		archived: z.coerce.boolean(),
		productId: z.uuidv7(),
	}))
	,
	async (c) => {
		const params = c.req.valid("param");
		const query = c.req.valid("query")

		const saleQueryDto = new SaleQueryDao(knexInstance);
		const sales = await saleQueryDto.queryById(params.saleId, { archived: query.archived, productId: query.productId });
		return c.json({ data: sales });
	}
);

app.post(
	"/",
	zValidator(
		"json",
		z.object({
			date: z.coerce.date(),
			quantity: z.number().int().min(1),
			status: z.enum(["completed", "in progress", "cancelled"]),
		})
	),
	zValidator(
		"param",
		z.object({
			productId: z.uuidv7(),
			variantId: z.uuidv7().optional(),
		})
	),
	async (c) => {
		const params = c.req.valid("param");
		const body = c.req.valid("json");
		const uow = new UnitOfWork(knexInstance, repositoryFactory);
		const usecase = new CreateSaleUsecase(uow, idGenerator);
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				accountId: fakeId,
				date: body.date,
				productId: params.productId,
				quantity: body.quantity,
				status: body.status,
			});
		});
		return c.json({ message: "Successfully created sale" });
	}
);
app.delete(
	"/:saleId",

	zValidator(
		"param",
		z.object({
			saleId: z.uuidv7(),
			productId: z.uuidv7(),
			variantId: z.uuidv7().optional(),
		})
	),

	async (c) => {
		const params = c.req.valid("param");
		const uow = new UnitOfWork(knexInstance, repositoryFactory);
		const usecase = new ArchiveSaleUsecase(uow);
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				saleId: params.saleId,
				productId: params.productId,
			});
		});
		return c.json({ message: "Successfully deleted sale" });
	}
);
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
			.partial()
	),
	zValidator(
		"param",
		z.object({
			saleId: z.uuidv7(),
			productId: z.uuidv7(),
			variantId: z.uuidv7().optional(),
		})
	),
	async (c) => {
		const params = c.req.valid("param");
		const body = c.req.valid("json");
		const uow = new UnitOfWork(knexInstance, repositoryFactory);
		const usecase = new UpdateSaleUsecase(uow);
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				saleId: params.saleId,
				productId: params.productId,
				fields: {
					date: body.date,
					quantity: body.quantity,
					status: body.status,
				},
			});
		});
		return c.json({ message: "Successfully updated sale" });
	}
);

export default app;
