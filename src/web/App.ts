import { Hono } from "hono"
import { cors } from "hono/cors" 
import supplierRouter from "./routers/SupplierRouter.js"
import deliveryRouter from "./routers/DeliveryRouter.js"
import categoryRouter from "./routers/CategoryRouter.js"
import forecastRouter from "./routers/ForecastRouter.js"
import groupRouter from "./routers/ProductGroupRouter.js"
import { ApplicationException } from "../core/exceptions/ApplicationException.js"
import { StatusCode } from "hono/utils/http-status"

const app = new Hono()

app.use('/*', cors())


app.use('/*', cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], 
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}))

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

app.route("/groups", groupRouter)
app.route("/suppliers", supplierRouter)
app.route("/deliveries", deliveryRouter)
app.route("/categories", categoryRouter)
app.route("/forecasts", forecastRouter)

export default app