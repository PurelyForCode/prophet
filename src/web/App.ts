import { Hono } from "hono"
import { cors } from "hono/cors"
import { ApplicationException } from "../core/exceptions/ApplicationException.js"
import { StatusCode } from "hono/utils/http-status"
import { sessionMiddleware, SessionOptions } from "hono-sessions"
import { knexInstance } from "../config/Knex.js"
import { PostgresqlSessionStore } from "../infra/utils/PostgresqlSessionStore.js"

import supplierRouter from "./routers/SupplierRouter.js"
import deliveryRouter from "./routers/DeliveryRouter.js"
import categoryRouter from "./routers/CategoryRouter.js"
import groupRouter from "./routers/ProductGroupRouter.js"
import accountRouter from "./routers/AccountRouter.js"
import saleRouter from "./routers/IndependentSaleRouter.js"
import recommendationRouter from "./routers/RecommendationRouter.js"
import authenticationRouter from "./routers/AuthenticationRouter.js"

const environment = process.env.ENVIRONMENT ?? "dev"
const frontendDomain = process.env.FRONTEND_DOMAIN

const app = new Hono()

app.use(
	"/*",
	cors({
		origin: (origin) => {
			// Allow your frontend explicitly
			const allowedOrigins = ["http://localhost:3000", frontendDomain]
			if (origin && allowedOrigins.includes(origin)) {
				return origin
			}
			return "http://localhost:3000" // fallback for dev
		},
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "PUT", "PATCH", "DELETE", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
)

const postgresqlSessionStore = new PostgresqlSessionStore(knexInstance)

const sessionOptions: SessionOptions =
	environment === "prod"
		? {
				store: postgresqlSessionStore,
				cookieOptions: {
					httpOnly: true,
					secure: true,
					sameSite: "lax",
					path: "/",
					maxAge: 60 * 60 * 24 * 7,
				},
				autoExtendExpiration: true,
				sessionCookieName: "session",
			}
		: {
				store: postgresqlSessionStore,
				cookieOptions: {
					httpOnly: true,
					secure: false,
					sameSite: "lax",
					path: "/",
					maxAge: 60 * 60 * 24,
				},
				autoExtendExpiration: true,
				sessionCookieName: "session",
			}

app.use("/auth/*", sessionMiddleware(sessionOptions))

app.onError((err, c) => {
	if (err instanceof ApplicationException) {
		c.status(err.statusCode as StatusCode)
		return c.json({
			error: err.message,
			debugMessage: err.debugMessage,
		})
	}
	// NOTE: Add logging
	console.error(err)
	return c.json(
		{
			error: "Internal Server Error",
			debugMessage:
				process.env.NODE_ENV === "development"
					? err.message
					: undefined,
		},
		500,
	)
})

app.route("/auth", authenticationRouter)
app.route("/recommendations", recommendationRouter)
app.route("/accounts", accountRouter)
app.route("/groups", groupRouter)
app.route("/suppliers", supplierRouter)
app.route("/deliveries", deliveryRouter)
app.route("/categories", categoryRouter)
app.route("/sales", saleRouter)

export default app
