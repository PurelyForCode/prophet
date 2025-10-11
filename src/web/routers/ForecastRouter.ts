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

// When should you forecast?
// 1. When prompted by the owner to forecast everything
// 2. Seasonally

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
			forecastStartDate: z.date(),
			forecastEndDate: z.date(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new GenerateSingleForecastUsecase(forecastApi)
		const params = c.req.valid("param")
		const body = c.req.valid("json")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				productId: params.productId,
				accountId: fakeId,
				forecastingMethod: "prophet",
				dataDepth: body.dataDepth,
				forecastEndDate: body.forecastEndDate,
				forecastStartDate: body.forecastStartDate,
			})
		})
		return c.json({
			message: "Forecast successfully created",
		})
	},
)

export default app
