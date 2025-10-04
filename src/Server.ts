import "dotenv/config"
import { serve } from "@hono/node-server"
import app from "./web/App.js"

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
