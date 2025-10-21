import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { z } from "zod"
import { UnitOfWork } from "../../infra/utils/UnitOfWork.js"
import { knexInstance } from "../../config/Knex.js"
import { repositoryFactory } from "../../infra/utils/RepositoryFactory.js"
import { PasswordUtility } from "../../infra/utils/PasswordUtility.js"
import { LoginUsecase } from "../../application/account_management/login/Usecase.js"
import { Session } from "hono-sessions"

type SessionDataTypes = {
	accountId: string
}

const app = new Hono<{
	Variables: {
		session: Session<SessionDataTypes>
		session_key_rotation: boolean
	}
}>()

app.post(
	"/login",
	zValidator(
		"json",
		z.object({
			username: z.string().min(3).max(100),
			password: z.string(),
		}),
	),
	async (c) => {
		const session = c.get("session")
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new LoginUsecase(uow, new PasswordUtility())
		const body = c.req.valid("json")
		const account = await usecase.call({
			password: body.password,
			username: body.username,
		})
		session.set("accountId", account.id)
		return c.json({ message: "Login successful" })
	},
)

export default app
