import { Hono } from "hono";
import { CreateVariantController } from "../../features/product_management/variant/create_variant/Controller.js";
import { UnitOfWork } from "../../data/utils/UnitOfWork.js";
import { knexInstance } from "../../config/Knex.js";
import { repositoryFactory } from "../../data/utils/RepositoryFactory.js";
import { idGenerator } from "../../data/utils/IdGenerator.js";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import saleRouter from "./SaleRouter.js";
import { fakeId } from "../../fakeId.js";

const app = new Hono();

app.get("/", (c) => c.text("hit"));
app.post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string().max(50).min(1),
      stock: z.number().int().nonnegative().optional(),
    })
  ),
  zValidator(
    "param",
    z.object({
      productId: z.uuidv7(),
    })
  ),
  async (c) => {
    const body = c.req.valid("json");
    const param = c.req.valid("param");
    const controller = new CreateVariantController(
      new UnitOfWork(knexInstance, repositoryFactory),
      idGenerator
    );
    const result = await controller.handle({
      accountId: fakeId,
      name: body.name,
      productId: param.productId,
      stock: body.stock,
    });
    return c.json(result);
  }
);
app.delete("/:variantId");
app.patch("/:variantId");
app.get("/:variantId");
app.route("/sales", saleRouter);

export default app;
