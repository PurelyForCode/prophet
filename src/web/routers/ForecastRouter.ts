import { Hono } from "hono"
import { UnitOfWork } from "../../infra/utils/UnitOfWork.js"
import { knexInstance } from "../../config/Knex.js"
import { repositoryFactory } from "../../infra/utils/RepositoryFactory.js"
import { GenerateSingleForecastUsecase } from "../../application/forecasting/generate_single_forecast/Usecase.js"
import { forecastApi } from "../../infra/services/ForecastApi.js"
import { zValidator } from "@hono/zod-validator"
import { domainEventBus } from "../../infra/events/EventBusConfiguration.js"
import { idGenerator } from "../../infra/utils/IdGenerator.js"
import {
	ForecastIncludeFields,
	ForecastQueryDao,
	ForecastSortFields,
} from "../../infra/db/query_dao/ForecastQueryDao.js"
import { includeStringSchema } from "../validation/IncludeStringSchema.js"
import { booleanStringSchema } from "../validation/BooleanStringSchema.js"
import { sortStringSchema } from "../validation/SortStringSchema.js"
import { ProductGroupQueryDao } from "../../infra/db/query_dao/ProductGroupQueryDao.js"
import { ProductQueryDao } from "../../infra/db/query_dao/ProductQueryDao.js"
import { ProductGroupNotFoundException } from "../../domain/product_management/exceptions/ProductGroupNotFoundException.js"
import { ProductNotFoundException } from "../../domain/product_management/exceptions/ProductNotFoundException.js"
import { ForecastNotFoundException } from "../../domain/forecasting/exceptions/ForecastNotFoundException.js"
import z from "zod"
import { authorize } from "../middleware/AuthorizeMiddleware.js"
import { EvaluateForecastAccuracyUsecase } from "../../application/forecasting/evaluate_forecast_accuracy/Usecase.js"

const app = new Hono()

app.post(
	"/",
	authorize(["MANAGE_FORECASTS"]),
	zValidator(
		"param",
		z.object({
			groupId: z.uuidv7(),
			productId: z.uuidv7(),
		}),
	),
	zValidator(
		"json",
		z.object({
			dataDepth: z.number(),
			forecastStartDate: z.coerce.date(),
			forecastEndDate: z.coerce.date(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new GenerateSingleForecastUsecase(
			forecastApi,
			idGenerator,
			uow,
			domainEventBus,
		)
		const params = c.req.valid("param")
		const body = c.req.valid("json")
		const accountId = c.get("accountId")
		await usecase.call({
			groupId: params.groupId,
			productId: params.productId,
			accountId: accountId,
			dataDepth: body.dataDepth,
			forecastEndDate: body.forecastEndDate,
			forecastStartDate: body.forecastStartDate,
		})
		return c.json({
			message: "Successfully created forecast",
		})
	},
)

app.get(
	"/",
	authorize(["MANAGE_FORECASTS"]),
	zValidator(
		"param",
		z.object({
			groupId: z.uuidv7(),
			productId: z.uuidv7(),
		}),
	),

	zValidator(
		"query",
		z
			.object({
				include: includeStringSchema(
					new Set<ForecastIncludeFields>(["entries"]),
				),
				sort: sortStringSchema(new Set<ForecastSortFields>(["date"])),
				latest: booleanStringSchema,
			})
			.partial(),
	),
	async (c) => {
		const gQueryDao = new ProductGroupQueryDao(knexInstance)
		const pQueryDao = new ProductQueryDao(knexInstance)
		const fQueryDao = new ForecastQueryDao(knexInstance)

		const params = c.req.valid("param")
		if (!(await gQueryDao.exists(params.groupId))) {
			throw new ProductGroupNotFoundException()
		}

		if (!(await pQueryDao.exists(params.productId))) {
			throw new ProductNotFoundException()
		}

		const query = c.req.valid("query")
		const forecast = await fQueryDao.query(
			{
				productId: params.productId,
				latest: query.latest,
			},
			query.include,
			query.sort,
		)
		return c.json({
			data: forecast,
		})
	},
)

app.get(
	"/:forecastId",
	authorize(["MANAGE_FORECASTS"]),
	zValidator(
		"param",
		z.object({
			groupId: z.uuidv7(),
			productId: z.uuidv7(),
			forecastId: z.uuidv7(),
		}),
	),

	zValidator(
		"query",
		z.object({
			include: includeStringSchema(
				new Set<ForecastIncludeFields>(["entries"]),
			),
		}),
	),
	async (c) => {
		const fQueryDao = new ForecastQueryDao(knexInstance)
		const gQueryDao = new ProductGroupQueryDao(knexInstance)
		const pQueryDao = new ProductQueryDao(knexInstance)

		const params = c.req.valid("param")
		if (!(await gQueryDao.exists(params.groupId))) {
			throw new ProductGroupNotFoundException()
		}

		if (!(await pQueryDao.exists(params.productId))) {
			throw new ProductNotFoundException()
		}

		const query = c.req.valid("query")
		const forecast = await fQueryDao.queryById(
			params.forecastId,
			query.include,
		)
		if (!forecast) {
			throw new ForecastNotFoundException()
		}
		return c.json({
			data: forecast,
		})
	},
)

app.get(
	"/:forecastId/accuracy",
	authorize(["MANAGE_FORECASTS"]),
	zValidator(
		"param",
		z.object({
			groupId: z.uuidv7(),
			productId: z.uuidv7(),
			forecastId: z.uuidv7(),
		}),
	),
	async (c) => {
		const gQueryDao = new ProductGroupQueryDao(knexInstance)
		const pQueryDao = new ProductQueryDao(knexInstance)

		const params = c.req.valid("param")
		if (!(await gQueryDao.exists(params.groupId))) {
			throw new ProductGroupNotFoundException()
		}

		if (!(await pQueryDao.exists(params.productId))) {
			throw new ProductNotFoundException()
		}

		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new EvaluateForecastAccuracyUsecase(knexInstance, uow)

		const result = await usecase.call({
			forecastId: params.forecastId,
		})

		return c.json({
			data: result,
		})
	},
)

export default app
