import { Hono } from "hono"
import { CreateDeliveryUsecase } from "../../application/delivery_management/delivery/create_delivery/Usecase.js"
import { runInTransaction, UnitOfWork } from "../../infra/utils/UnitOfWork.js"
import { knexInstance } from "../../config/Knex.js"
import { repositoryFactory } from "../../infra/utils/RepositoryFactory.js"
import { idGenerator } from "../../infra/utils/IdGenerator.js"
import { IsolationLevel } from "../../core/interfaces/IUnitOfWork.js"
import { zValidator } from "@hono/zod-validator"
import z from "zod"
import { fakeId } from "../../fakeId.js"
import { AddItemToDeliveryUsecase } from "../../application/delivery_management/delivery_item/add_item/Usecase.js"
import { UpdateItemInDeliveryUsecase } from "../../application/delivery_management/delivery_item/update_item/Usecase.js"
import { RemoveItemOnDeliveryUsecase } from "../../application/delivery_management/delivery_item/remove_item/Usecase.js"
import {
	DeliveryQueryDao,
	DeliverySortableFields,
} from "../../infra/db/query_dao/DeliveryQueryDao.js"
import { sortStringSchema } from "../validation/SortStringSchema.js"
import { DeliveryStatusValue } from "../../domain/delivery_management/entities/delivery/value_objects/DeliveryStatus.js"
import { booleanStringSchema } from "../validation/BooleanStringSchema.js"
import { DeliveryNotFoundException } from "../../domain/delivery_management/exceptions/DeliveryNotFoundException.js"
import { UpdateDeliveryUsecase } from "../../application/delivery_management/delivery/update_delivery/Usecase.js"
import {
	DeliveryItemQueryDao,
	DeliveryItemSortableFields,
} from "../../infra/db/query_dao/DeliveryItemQueryDao.js"
import { DeliveryItemNotFoundException } from "../../domain/delivery_management/exceptions/DeliveryItemNotFoundException.js"
import { ArchiveDeliveryUsecase } from "../../application/delivery_management/delivery/archive_delivery/Usecase.js"
import { domainEventBus } from "../../infra/events/EventBusConfiguration.js"
import { authorize } from "../middleware/AuthorizeMiddleware.js"

const app = new Hono()

app.get(
	"/",
	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"query",
		z
			.object({
				offset: z.coerce.number().nonnegative(),
				limit: z.coerce.number().positive(),
				status: z.enum<DeliveryStatusValue[]>([
					"completed",
					"cancelled",
					"pending",
				]),
				sort: sortStringSchema(
					new Set<DeliverySortableFields>(["scheduledArrivalDate"]),
				),
			})
			.partial(),
	),
	async (c) => {
		const deliveryQueryDao = new DeliveryQueryDao(knexInstance)
		const query = c.req.valid("query")
		const delivery = await deliveryQueryDao.query(
			{
				limit: query.limit,
				offset: query.offset,
			},
			{
				status: query.status,
			},
			query.sort,
		)
		return c.json({ data: delivery })
	},
)

app.get(
	"/:deliveryId",
	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"param",
		z.object({
			deliveryId: z.uuidv7(),
		}),
	),
	async (c) => {
		const deliveryQueryDao = new DeliveryQueryDao(knexInstance)
		const params = c.req.valid("param")
		const delivery = await deliveryQueryDao.queryById(params.deliveryId)
		if (!delivery) {
			throw new DeliveryNotFoundException()
		}
		return c.json({ data: delivery })
	},
)

app.post(
	"/",
	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"json",
		z.object({
			items: z
				.array(
					z.object({
						productId: z.uuidv7(),
						quantity: z.int().positive(),
					}),
				)
				.optional(),
			status: z.enum<DeliveryStatusValue[]>([
				"completed",
				"pending",
				"cancelled",
			]),
			supplierId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new CreateDeliveryUsecase(
			uow,
			idGenerator,
			domainEventBus,
		)
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

app.patch(
	"/:deliveryId",
	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"json",
		z
			.object({
				status: z.enum<DeliveryStatusValue[]>([
					"completed",
					"pending",
					"cancelled",
				]),
				cancelledAt: z.coerce.date(),
				completedAt: z.coerce.date(),
				requestedAt: z.coerce.date(),
				scheduledArrivalDate: z.coerce.date(),
			})
			.partial(),
	),
	zValidator(
		"param",
		z.object({
			deliveryId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new UpdateDeliveryUsecase(uow, domainEventBus)
		const body = c.req.valid("json")
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				deliveryId: params.deliveryId,
				fields: {
					cancelledAt: body.cancelledAt,
					completedAt: body.completedAt,
					requestedAt: body.requestedAt,
					scheduledArrivalDate: body.scheduledArrivalDate,
					status: body.status,
				},
			})
		})
		return c.json({
			message: "Successfully updated delivery",
		})
	},
)

app.delete(
	"/:deliveryId",
	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"param",
		z.object({
			deliveryId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new ArchiveDeliveryUsecase(uow)
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				deliveryId: params.deliveryId,
			})
		})
		return c.json({
			message: "Successfully archived delivery",
		})
	},
)

app.get(
	"/:deliveryId/items",
	authorize(["MANAGE_PRODUCTS"]),
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
				offset: z.coerce.number().nonnegative(),
				limit: z.coerce.number().positive(),
				archived: booleanStringSchema,
				productId: z.uuidv7(),
				sort: sortStringSchema(
					new Set<DeliveryItemSortableFields>(["quantity"]),
				),
			})
			.partial(),
	),
	async (c) => {
		const params = c.req.valid("param")
		const query = c.req.valid("query")
		const deliveryItemQueryDao = new DeliveryItemQueryDao(knexInstance)
		const result = await deliveryItemQueryDao.queryByDeliveryId(
			params.deliveryId,
			{ limit: query.limit, offset: query.offset },
			{ productId: query.productId },
			query.sort,
		)
		return c.json({ data: result })
	},
)

app.get(
	"/:deliveryId/items/:itemId",
	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"param",
		z.object({
			deliveryId: z.uuidv7(),
			itemId: z.uuidv7(),
		}),
	),
	async (c) => {
		const params = c.req.valid("param")
		const deliveryQueryDao = new DeliveryQueryDao(knexInstance)
		const delivery = await deliveryQueryDao.exists(params.deliveryId)
		if (!delivery) {
			throw new DeliveryNotFoundException()
		}
		const deliveryItemQueryDao = new DeliveryItemQueryDao(knexInstance)
		const result = await deliveryItemQueryDao.queryById(params.itemId)
		if (!result) {
			throw new DeliveryItemNotFoundException()
		}
		return c.json({ data: result })
	},
)

app.post(
	"/:deliveryId/items",
	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"json",
		z.object({
			items: z.array(
				z.object({
					productId: z.uuidv7(),
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
		const usecase = new AddItemToDeliveryUsecase(uow, idGenerator)
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
	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"json",
		z.object({
			quantity: z.int().positive(),
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
		const usecase = new UpdateItemInDeliveryUsecase(uow)
		const body = c.req.valid("json")
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				deliveryId: params.deliveryId,
				itemId: params.itemId,
				quantity: body.quantity,
			})
		})
		return c.json({
			message: "Successfully updated item in delivery",
		})
	},
)

app.delete(
	"/:deliveryId/items/:itemId",
	authorize(["MANAGE_PRODUCTS"]),
	zValidator(
		"param",
		z.object({
			deliveryId: z.uuidv7(),
			itemId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new RemoveItemOnDeliveryUsecase(uow)
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				deliveryId: params.deliveryId,
				itemId: params.itemId,
			})
		})
		return c.json({
			message: "Successfully removed item in delivery",
		})
	},
)

export default app
