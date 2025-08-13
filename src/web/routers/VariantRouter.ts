import { Hono } from "hono";
import { UnitOfWork } from "../../infra/utils/UnitOfWork.js";
import { knexInstance } from "../../config/Knex.js";
import { repositoryFactory } from "../../infra/utils/RepositoryFactory.js";
import { idGenerator } from "../../infra/utils/IdGenerator.js";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import saleRouter from "./SaleRouter.js";
import { fakeId } from "../../fakeId.js";
import { CreateVariantUsecase } from "../../features/product_management/variant/create_variant/Usecase.js";

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
    const usecase = new CreateVariantUsecase(
      new UnitOfWork(knexInstance, repositoryFactory),
      idGenerator
    );
    const result = await usecase.call({
      accountId: fakeId,
      name: body.name,
      productId: param.productId,
      stock: body.stock,
    });
    return c.json({ message: "Successfully created variant" });
  }
);
app.delete("/:variantId");
app.patch("/:variantId");
app.get("/:variantId");
app.route("/sales", saleRouter);

export default app;
