import { Context, Next } from "hono"
import { knexInstance } from "../../config/Knex.js"
import { AccountQueryDao } from "../../infra/db/query_dao/AccountQueryDao.js"
import { AccountNotFoundException } from "../../domain/account_management/exceptions/AccountNotFoundException.js"
import { Session } from "hono-sessions"

export const authorize =
	(requiredPermissions: string[] = []) =>
	async (c: Context, next: Next) => {
		const session = c.get("session") as Session
		const accountId = session?.get("accountId")

		if (!accountId) {
			return c.json({ error: "Unauthorized" }, 401)
		}
		const accountQueryDao = new AccountQueryDao(knexInstance)
		const account = await accountQueryDao.queryById(accountId, {
			permissions: true,
		})
		if (!account) {
			throw new AccountNotFoundException()
		}
		if (
			account.role !== "superadmin" &&
			account.role !== "admin" &&
			account.role !== "staff manager"
		) {
			const userPermissions = account.permissions

			const userPermissionNames = userPermissions!.map((p) => p.name)

			const hasAllPermissions = requiredPermissions.every((perm) =>
				userPermissionNames.includes(perm),
			)

			if (!hasAllPermissions) {
				return c.json({ error: "Forbidden" }, 403)
			}
		}
		session.touch()
		await next()
	}
