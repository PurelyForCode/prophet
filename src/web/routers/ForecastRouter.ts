import { Hono } from "hono"
import { runInTransaction, UnitOfWork } from "../../infra/utils/UnitOfWork.js"
import { knexInstance } from "../../config/Knex.js"
import { repositoryFactory } from "../../infra/utils/RepositoryFactory.js"
import { GenerateSingleForecastUsecase } from "../../application/forecasting/generate_single_forecast/Usecase.js"
import { forecastApi } from "../../infra/services/ForecastApi.js"
import { zValidator } from "@hono/zod-validator"
import z from "zod"
import { IsolationLevel } from "../../core/interfaces/IUnitOfWork.js"
import { fakeId } from "../../fakeId.js"
import { domainEventBus } from "../../infra/events/EventBusConfiguration.js"

const app = new Hono()

app.post(
	"/:productId",
	zValidator(
		"param",
		z.object({
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
			uow,
			domainEventBus,
		)
		const params = c.req.valid("param")
		const body = c.req.valid("json")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			return await usecase.call({
				productId: params.productId,
				accountId: fakeId,
				dataDepth: body.dataDepth,
				forecastEndDate: body.forecastEndDate,
				forecastStartDate: body.forecastStartDate,
			})
		})
		return c.json({
			message: "Successfully created forecast",
		})
	},
)

export default app
