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
import {
	AccountIncludeField,
	AccountQueryDao,
	AccountSortableFields,
} from "../../infra/db/query_dao/AccountQueryDao.js"
import { includeStringSchema } from "../validation/IncludeStringSchema.js"
import { sortStringSchema } from "../validation/SortStringSchema.js"
import { RoleValues } from "../../domain/account_management/entities/account/value_objects/Role.js"
import { ArchiveAccountUsecase } from "../../application/account_management/archive_account/Usecase.js"
import { UpdateAccountUsecase } from "../../application/account_management/update_account/Usecase.js"
import { ChangePasswordUsecase } from "../../application/account_management/change_password/Usecase.js"
import { Password } from "../../domain/account_management/entities/account/value_objects/Password.js"
import { AccountNotFoundException } from "../../domain/account_management/exceptions/AccountNotFoundException.js"
import { authorize } from "../middleware/AuthorizeMiddleware.js"

const app = new Hono()

app.get("/permissions", async (c) => {
	const permissionQueryDao = new PermissionQueryDao(knexInstance)
	const result = await permissionQueryDao.query()
	return c.json({
		data: result,
	})
})

app.get(
	"/",
	authorize(["MANAGE_ACCOUNTS"]),
	zValidator(
		"query",
		z
			.object({
				sort: sortStringSchema(
					new Set<AccountSortableFields>(["role"]),
				),
				include: includeStringSchema(
					new Set<AccountIncludeField>(["permissions"]),
				),
				role: z.enum<RoleValues[]>([
					"store manager",
					"staff",
					"admin",
					"superadmin",
				]),
				limit: z.coerce.number().int().positive(),
				offset: z.coerce.number().int().nonnegative(),
			})
			.partial(),
	),
	async (c) => {
		const accountQueryDao = new AccountQueryDao(knexInstance)
		const query = c.req.valid("query")
		const data = await accountQueryDao.query(
			{
				limit: query.limit,
				offset: query.offset,
			},
			{ role: query.role },
			query.include,
			query.sort,
		)
		return c.json({ data })
	},
)

app.get(
	"/:accountId",
	authorize(["MANAGE_ACCOUNTS"]),
	zValidator(
		"param",
		z.object({
			accountId: z.uuidv7(),
		}),
	),
	zValidator(
		"query",
		z
			.object({
				include: includeStringSchema(
					new Set<AccountIncludeField>(["permissions"]),
				),
			})
			.partial(),
	),
	async (c) => {
		const accountQueryDao = new AccountQueryDao(knexInstance)
		const query = c.req.valid("query")
		const params = c.req.valid("param")
		const data = await accountQueryDao.queryById(
			params.accountId,
			query.include,
		)
		if (!data) {
			throw new AccountNotFoundException()
		}
		return c.json({ data })
	},
)

app.post(
	"/",
	authorize(["MANAGE_ACCOUNTS"]),
	zValidator(
		"json",
		z.object({
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

app.delete(
	"/:accountId",
	authorize(["MANAGE_ACCOUNTS"]),
	zValidator(
		"param",
		z.object({
			accountId: z.uuidv7(),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new ArchiveAccountUsecase(uow)
		const params = c.req.valid("param")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({ accountId: params.accountId })
		})
		return c.json({ message: "Account successfully archived" })
	},
)

app.patch(
	"/:accountId",
	authorize(["MANAGE_ACCOUNTS"]),
	zValidator(
		"param",
		z.object({
			accountId: z.uuidv7(),
		}),
	),

	zValidator(
		"json",
		z.object({
			role: z.enum<RoleValues[]>(["store manager", "admin", "staff"]),
			username: z.string().min(3).max(100),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new UpdateAccountUsecase(uow)
		const params = c.req.valid("param")
		const body = c.req.valid("json")
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				accountId: params.accountId,
				fields: { role: body.role, username: body.username },
			})
		})
		return c.json({ message: "Account successfully updated" })
	},
)

app.patch(
	"/:accountId/password",
	authorize(["MANAGE_ACCOUNTS"]),
	zValidator(
		"param",
		z.object({
			accountId: z.uuidv7(),
		}),
	),

	zValidator(
		"json",
		z.object({
			password: z.string().min(8),
		}),
	),
	async (c) => {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new ChangePasswordUsecase(uow, new PasswordUtility())
		const params = c.req.valid("param")
		const body = c.req.valid("json")

		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call({
				accountId: params.accountId,
				actorId: fakeId,
				password: body.password,
			})
		})

		return c.json({ message: "Account password changed" })
	},
)

app.post(
	"/:accountId/permissions",
	authorize(["MANAGE_ACCOUNTS"]),
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
	authorize(["MANAGE_ACCOUNTS"]),
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
