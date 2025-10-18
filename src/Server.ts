import "dotenv/config"
import { serve } from "@hono/node-server"
import app from "./web/App.js"
import { runInTransaction, UnitOfWork } from "./infra/utils/UnitOfWork.js"
import { knexInstance } from "./config/Knex.js"
import { repositoryFactory } from "./infra/utils/RepositoryFactory.js"
import { createSuperAdmin } from "./application/presetup/CreateSuperAdmin.js"
import { PasswordUtility } from "./infra/utils/PasswordUtility.js"
import { idGenerator } from "./infra/utils/IdGenerator.js"
import { IsolationLevel } from "./core/interfaces/IUnitOfWork.js"
import { createPermissions } from "./application/presetup/CreatePermissions.js"

async function preSetup() {
	const unitOfWork = new UnitOfWork(knexInstance, repositoryFactory)
	const passwordUtility = new PasswordUtility()
	await runInTransaction(
		unitOfWork,
		IsolationLevel.READ_COMMITTED,
		async () => {
			await createSuperAdmin(unitOfWork, passwordUtility, idGenerator)
			await createPermissions()
		},
	)
}

await preSetup()

const server = serve(
	{
		fetch: app.fetch,
		port: 8000,
	},
	(info) => {
		console.log(`Running on ${info.port}`)
	},
)

process.on("SIGINT", () => {
	server.close()
	process.exit(0)
})

process.on("SIGTERM", () => {
	server.close((err) => {
		if (err) {
			console.error(err)
			process.exit(1)
		}
		process.exit(0)
	})
})
