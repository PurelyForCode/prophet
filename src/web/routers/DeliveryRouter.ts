import { Hono } from "hono"
import { CreateDeliveryUsecase } from "../../application/delivery_management/delivery/create_delivery/Usecase.js"
import { runInTransaction, UnitOfWork } from "../../infra/utils/UnitOfWork.js"
import { knexInstance } from "../../config/Knex.js"
import { repositoryFactory } from "../../infra/utils/RepositoryFactory.js"
import { EventBus } from "../../infra/events/DomainEventBus.js"
import { idGenerator } from "../../infra/utils/IdGenerator.js"
import { IsolationLevel } from "../../core/interfaces/IUnitOfWork.js"
import { zValidator } from "@hono/zod-validator"
import z from "zod"
import { fakeId } from "../../fakeId.js"
import { CancelDeliveryUsecase } from "../../application/delivery_management/delivery/cancel_delivery/Usecase.js"
import { ConfirmDeliveryArrivalUsecase } from "../../application/delivery_management/delivery/confirm_delivery_arrival/Usecase.js"
import { AddItemToDeliveryUsecase } from "../../application/delivery_management/delivery_item/add_item/Usecase.js"
import { UpdateItemInDeliveryUsecase } from "../../application/delivery_management/delivery_item/update_item/Usecase.js"
import { RemoveItemOnDeliveryUsecase } from "../../application/delivery_management/delivery_item/remove_item/Usecase.js"
import {
	DeliveryQueryDao,
	DeliveryQuerySort,
	DeliverySortableFields,
} from "../../infra/db/query_dao/DeliveryQueryDao.js"
import { parseSortQueryString } from "../utils/parseSortQueryString.js"

const app = new Hono()

app.get(
	"/",
	zValidator(
		"query",
		z
			.object({
				offset: z.coerce.number().positive(),
				limit: z.coerce.number().positive(),
				archived: z.coerce.boolean(),
				status: z.enum([""]),
				sort: z.string(),
			})
			.partial(),
	),
	async (c) => {
		const deliveryQueryDao = new DeliveryQueryDao(knexInstance)
		const query = c.req.valid("query")
		let sort = undefined
		if (query.sort) {
			sort = parseSortQueryString<DeliverySortableFields>(query.sort, [
				"scheduledArrivalDate",
			])
		}

		const delivery = await deliveryQueryDao.query(
			{
				limit: query.limit,
				offset: query.offset,
			},
			{
				archived: query.archived,
				status: query.status,
			},
			sort,
		)
		return c.json({ data: delivery })
	},
)

app.get(
	"/:deliveryId",

	zValidator(
		"param",
		z.object({
			deliveryId: z.uuidv7(),
		}),
	),
	zValidator(
		"query",
		z
			.object({
				archived: z.coerce.boolean(),
			})
			.partial(),
	),
	async (c) => {
		const deliveryQueryDao = new DeliveryQueryDao(knexInstance)
		const params = c.req.valid("param")
		const query = c.req.valid("query")

		const delivery = await deliveryQueryDao.queryById(
			params.deliveryId,
			query.archived,
		)
		return c.json({ data: delivery })
	},
)
app.post(
	"/",
	zValidator(
		"json",
		z.object({
			items: z
				.array(
					z.object({
						productId: z.uuidv7(),
						variantId: z.uuidv7().nullable(),
						quantity: z.int().positive(),
					}),
				)
				.optional(),
			status: z.enum([]),
			supplierId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const eventBus = new EventBus()
		const usecase = new CreateDeliveryUsecase(uow, eventBus, idGenerator)
		const body = c.req.valid("json")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				accountId: fakeId,
				items: body.items,
				status: body.status,
				supplierId: body.supplierId,
			})
		})
		c.status(201)
		return c.json({
			message: "Successfully created delivery",
		})
	},
)

app.post(
	"/:deliveryId/arrived",
	zValidator(
		"param",
		z.object({
			deliveryId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const eventBus = new EventBus()
		const usecase = new ConfirmDeliveryArrivalUsecase(uow, eventBus)
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				deliveryId: params.deliveryId,
			})
		})
		return c.json({
			message: "Delivery arrived successfully",
		})
	},
)

app.post(
	"/:deliveryId/cancel",
	zValidator(
		"param",
		z.object({
			deliveryId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const eventBus = new EventBus()
		const usecase = new CancelDeliveryUsecase(uow, eventBus)
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				deliveryId: params.deliveryId,
			})
		})
		return c.json({
			message: "Successfully cancelled delivery",
		})
	},
)

app.post(
	"/:deliveryId/items",
	zValidator(
		"json",
		z.object({
			items: z.array(
				z.object({
					productId: z.uuidv7(),
					variantId: z.uuidv7().nullable(),
					quantity: z.int().positive(),
				}),
			),
		}),
	),
	zValidator(
		"param",
		z.object({
			deliveryId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const eventBus = new EventBus()
		const usecase = new AddItemToDeliveryUsecase(uow, eventBus, idGenerator)
		const body = c.req.valid("json")
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				deliveryId: params.deliveryId,
				items: body.items,
			})
		})
		c.status(201)
		return c.json({
			message: "Successfully added item/s to delivery",
		})
	},
)

app.patch(
	"/:deliveryId/items/:itemId",
	zValidator(
		"json",
		z.object({
			items: z.array(
				z.object({
					id: z.uuidv7(),
					quantity: z.int().positive(),
				}),
			),
		}),
	),
	zValidator(
		"param",
		z.object({
			deliveryId: z.uuidv7(),
			itemId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const eventBus = new EventBus()
		const usecase = new UpdateItemInDeliveryUsecase(uow, eventBus)
		const body = c.req.valid("json")
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				deliveryId: params.deliveryId,
				items: body.items,
			})
		})
		return c.json({
			message: "Successfully updated items in delivery",
		})
	},
)

app.delete(
	"/:deliveryId/items",
	zValidator(
		"json",
		z.object({
			itemIds: z.array(z.uuidv7()),
		}),
	),
	zValidator(
		"param",
		z.object({
			deliveryId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const eventBus = new EventBus()
		const usecase = new RemoveItemOnDeliveryUsecase(uow, eventBus)
		const params = c.req.valid("param")
		const body = c.req.valid("json")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				deliveryId: params.deliveryId,
				itemIds: body.itemIds,
			})
		})
		return c.json({
			message: "Successfully removed items in delivery",
		})
	},
)

export default app
