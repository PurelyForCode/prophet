import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { z } from "zod"
import { runInTransaction, UnitOfWork } from "../../infra/utils/UnitOfWork.js"
import { knexInstance } from "../../config/Knex.js"
import { repositoryFactory } from "../../infra/utils/RepositoryFactory.js"
import { IsolationLevel } from "../../core/interfaces/IUnitOfWork.js"
import { RemoveProphetChangepointUsecase } from "../../application/forecasting/remove_prophet_changepoint/Usecase.js"
import { RemoveProphetSeasonalityUsecase } from "../../application/forecasting/remove_prophet_seasonality/Usecase.js"
import { CreateProphetModelUsecase } from "../../application/forecasting/create_prophet_model/Usecase.js"
import { idGenerator } from "../../infra/utils/IdGenerator.js"

const app = new Hono()

app.get(
	"/",

	zValidator(
		"param",
		z.object({
			groupId: z.uuidv7(),
			productId: z.uuidv7(),
		}),
	),
	(c) => {
		return c.json({})
	},
)

app.get(
	"/:modelId",
	zValidator(
		"param",
		z.object({
			modelId: z.uuidv7(),
			groupId: z.uuidv7(),
			productId: z.uuidv7(),
		}),
	),
	(c) => {
		return c.json({})
	},
)

app.post(
	"/",
	zValidator(
		"param",
		z.object({
			groupId: z.uuidv7(),
			productId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new CreateProphetModelUsecase(uow, idGenerator)
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				productId: params.productId,
				seasonalityId: params.seasonalityId,
				prophetModelId: params.modelId,
				groupId: params.groupId,
			})
		})
		return c.json({ message: "Successfully deleted changepoint" })
	},
)
app.delete(
	"/:modelId",
	zValidator(
		"param",
		z.object({
			groupId: z.uuidv7(),
			modelId: z.uuidv7(),
			productId: z.uuidv7(),
		}),
	),
	(c) => {
		return c.json({})
	},
)
app.patch(
	"/:modelId",
	zValidator(
		"param",
		z.object({
			groupId: z.uuidv7(),
			modelId: z.uuidv7(),
			productId: z.uuidv7(),
		}),
	),
	(c) => {
		return c.json({})
	},
)

app.post(
	"/:modelId/holidays",
	zValidator(
		"param",
		z.object({
			groupId: z.uuidv7(),
			modelId: z.uuidv7(),
			productId: z.uuidv7(),
		}),
	),
	(c) => {
		return c.json({})
	},
)
app.post(
	"/:modelId/seasonalities",

	zValidator(
		"param",
		z.object({
			groupId: z.uuidv7(),
			modelId: z.uuidv7(),
			productId: z.uuidv7(),
		}),
	),
	(c) => {
		return c.json({})
	},
)
app.post(
	"/:modelId/changepoints",

	zValidator(
		"param",
		z.object({
			groupId: z.uuidv7(),
			modelId: z.uuidv7(),
			productId: z.uuidv7(),
		}),
	),
	(c) => {
		return c.json({})
	},
)

app.patch(
	"/:modelId/holidays/:holidayId",
	zValidator(
		"param",
		z.object({
			groupId: z.uuidv7(),
			modelId: z.uuidv7(),
			productId: z.uuidv7(),
			holidayId: z.uuidv7(),
		}),
	),
	(c) => {
		return c.json({})
	},
)
app.patch(
	"/:modelId/seasonalities/:seasonalityId",
	zValidator(
		"param",
		z.object({
			groupId: z.uuidv7(),
			modelId: z.uuidv7(),
			productId: z.uuidv7(),
			seasonalityId: z.uuidv7(),
		}),
	),
	(c) => {
		return c.json({})
	},
)
app.patch(
	"/:modelId/changepoints/:changepointId",
	zValidator(
		"param",
		z.object({
			groupId: z.uuidv7(),
			modelId: z.uuidv7(),
			productId: z.uuidv7(),
			changepointId: z.uuidv7(),
		}),
	),
	(c) => {
		return c.json({})
	},
)

app.delete(
	"/:modelId/holidays/:holidayId",

	zValidator(
		"param",
		z.object({
			groupId: z.uuidv7(),
			modelId: z.uuidv7(),
			productId: z.uuidv7(),
			holidayId: z.uuidv7(),
		}),
	),
	(c) => {
		return c.json({})
	},
)
app.delete(
	"/:modelId/seasonalities/:seasonalityId",
	zValidator(
		"param",
		z.object({
			groupId: z.uuidv7(),
			modelId: z.uuidv7(),
			productId: z.uuidv7(),
			seasonalityId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new RemoveProphetSeasonalityUsecase(uow)
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				productId: params.productId,
				seasonalityId: params.seasonalityId,
				prophetModelId: params.modelId,
				groupId: params.groupId,
			})
		})
		return c.json({ message: "Successfully deleted changepoint" })
	},
)
app.delete(
	"/:modelId/changepoints/:changepointId",
	zValidator(
		"param",
		z.object({
			groupId: z.uuidv7(),
			modelId: z.uuidv7(),
			productId: z.uuidv7(),
			changepointId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new RemoveProphetChangepointUsecase(uow)
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				productId: params.productId,
				changepointId: params.changepointId,
				prophetModelId: params.modelId,
			})
		})
		return c.json({ message: "Successfully deleted changepoint" })
	},
)

export default app
