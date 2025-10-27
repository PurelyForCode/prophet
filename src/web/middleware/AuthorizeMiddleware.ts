import { Context, Next } from "hono"
import { knexInstance } from "../../config/Knex.js"
import { AccountQueryDao } from "../../infra/db/query_dao/AccountQueryDao.js"
import { AccountNotFoundException } from "../../domain/account_management/exceptions/AccountNotFoundException.js"
import { Session } from "hono-sessions"
import { PermissionValues } from "../../application/presetup/CreatePermissions.js"

export const authorize =
	(requiredPermissions: PermissionValues[] = []) =>
	async (c: Context, next: Next) => {
		await next()

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

		// Superadmin bypasses all permission checks
		if (account.role === "superadmin") {
			session.touch()
			await next()
			return
		}

		// Check for "admin_access"
		if (requiredPermissions.includes("ADMIN_ACCESS")) {
			if (account.role !== "admin") {
				return c.json({ error: "Forbidden" }, 403)
			}
		} else if (account.role === "staff") {
			// For staff, check if all required permissions are present
			const userPermissions = account.permissions
			const userPermissionNames = userPermissions
				? userPermissions.map((p) => p.name)
				: []

			const hasAllPermissions = requiredPermissions.every((perm) =>
				userPermissionNames.includes(perm),
			)

			if (!hasAllPermissions) {
				console.log("unauthorized")
				return c.json({ error: "Forbidden" }, 403)
			}
		} else {
			console.log("unauthorized")
			if (requiredPermissions.length > 0) {
				return c.json({ error: "Forbidden" }, 403)
			}
		}

		session.touch()
		await next()
	}
