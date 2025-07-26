import { Hono } from "hono";
import productRouter from "./routers/ProductRouter.js";

export const app = new Hono().basePath("/api");

app.route("/products", productRouter);
