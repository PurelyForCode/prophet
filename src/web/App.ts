import { Hono } from "hono";
import productRouter from "./routers/ProductRouter.js";
import supplierRouter from "./routers/SupplierRouter.js";
import deliveryRouter from "./routers/DeliveryRouter.js";
import categoryRouter from "./routers/CategoryRouter.js";
import forecastRouter from "./routers/ForecastRouter.js";
export const app = new Hono().basePath("/api");

app.route("/products", productRouter);
app.route("/suppliers", supplierRouter);
app.route("/deliveries", deliveryRouter);
app.route("/categories", categoryRouter);
app.route("/forecasts", forecastRouter);
