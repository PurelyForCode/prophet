import { Hono } from "hono"
import { runInTransaction, UnitOfWork } from "../../infra/utils/UnitOfWork.js"
import { knexInstance } from "../../config/Knex.js"
import { repositoryFactory } from "../../infra/utils/RepositoryFactory.js"
import { IsolationLevel } from "../../core/interfaces/IUnitOfWork.js"
import { CreateAccountUsecase } from "../../application/account_management/create_account/Usecase.js"
import { idGenerator } from "../../infra/utils/IdGenerator.js"
import { PasswordUtility } from "../../infra/utils/PasswordUtility.js"
import { zValidator } from "@hono/zod-validator"
import z from "zod"
import { PermissionQueryDao } from "../../infra/db/query_dao/PermissionQueryDao.js"
import { GrantPermissionUsecase } from "../../application/account_management/grant_permission/Usecase.js"
import { fakeId } from "../../fakeId.js"
import { RevokePermissionUsecase } from "../../application/account_management/revoke_permission/Usecase.js"

const app = new Hono()

app.get("/permissions", async (c) => {
	const permissionQueryDao = new PermissionQueryDao(knexInstance)
	const result = await permissionQueryDao.query()
	return c.json({
		data: result,
	})
})

app.get("/", (c) => {
	return c.json({})
})

app.get("/:accountId", (c) => {
	return c.json({})
})

app.post(
	"/",
	zValidator(
		"json",
		z.object({
			accountId: z.uuidv7(),
			username: z.string().min(1).max(100),
			password: z.string().min(8),
			role: z.enum(["admin", "store manager", "staff"]),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new CreateAccountUsecase(
			uow,
			idGenerator,
			new PasswordUtility(),
		)
		const body = c.req.valid("json")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				accountId: body.accountId,
				password: body.password,
				role: body.role,
				username: body.username,
			})
		})
		c.status(201)
		return c.json({
			message: "Account successfully created",
		})
	},
)

app.delete("/:accountId", (c) => {
	return c.json({})
})

app.patch("/:accountId", (c) => {
	return c.json({})
})

app.get("/:accountId/permissions", (c) => {
	return c.json({})
})

app.post(
	"/:accountId/permissions",
	zValidator(
		"json",
		z.object({
			permissionId: z.uuidv7(),
		}),
	),
	zValidator("param", z.object({ accountId: z.uuidv7() })),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new GrantPermissionUsecase(uow)
		const body = c.req.valid("json")
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				accountId: fakeId,
				granteeId: params.accountId,
				permissionId: body.permissionId,
			})
		})
		c.status(201)
		return c.json({
			message: "Permission successfully granted",
		})
	},
)

app.delete(
	"/:accountId/permissions/:permissionId",
	zValidator(
		"param",
		z.object({ accountId: z.uuidv7(), permissionId: z.uuidv7() }),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new RevokePermissionUsecase(uow)
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				accountId: fakeId,
				granteeId: params.accountId,
				permissionId: params.permissionId,
			})
		})
		return c.json({
			message: "Permission successfully revoked",
		})
	},
)
export default app
