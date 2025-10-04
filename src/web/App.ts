import { Hono } from "hono"
import supplierRouter from "./routers/SupplierRouter.js"
import deliveryRouter from "./routers/DeliveryRouter.js"
import categoryRouter from "./routers/CategoryRouter.js"
import forecastRouter from "./routers/ForecastRouter.js"
import groupRouter from "./routers/ProductGroupRouter.js"
import { HTTPException } from "hono/http-exception"
import { ApplicationException } from "../core/exceptions/ApplicationException.js"
import { StatusCode } from "hono/utils/http-status"

const app = new Hono()

app.route("/groups", groupRouter)
// app.route("/suppliers", supplierRouter)
// app.route("/deliveries", deliveryRouter)
// app.route("/categories", categoryRouter)
// app.route("/forecasts", forecastRouter)

export default app
