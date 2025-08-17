import { Hono } from "hono";
import { UnitOfWork } from "../../infra/utils/UnitOfWork.js";
import { repositoryFactory } from "../../infra/utils/RepositoryFactory.js";
import { knexInstance } from "../../config/Knex.js";
import { zValidator } from "@hono/zod-validator";
import * as z from "zod/v4";
import { idGenerator } from "../../infra/utils/IdGenerator.js";
import { productSettingSchema } from "../validation/ProductSettingSchema.js";
import variantRouter from "./VariantRouter.js";
import { ProductDAO } from "../../infra/dao/ProductDAO.js";
import { CreateProductUsecase } from "../../features/product_management/product/create_product/Usecase.js";
import { runInTransaction } from "../../infra/utils/UnitOfWork.js";
import { IsolationLevel } from "../../core/interfaces/IUnitOfWork.js";
import { fakeId } from "../../fakeId.js";
import { ArchiveProductUsecase } from "../../features/product_management/product/archive_product/Usecase.js";
import { UpdateProductUsecase } from "../../features/product_management/product/update_product/Usecase.js";
import saleRouter from "./SaleRouter.js";
import { domainEventBus } from "../../infra/utils/DomainEventBus.js";

const app = new Hono();

app.get("/", async (c) => {
  const productDAO = new ProductDAO(knexInstance);
  const result = await productDAO.query(undefined, undefined);
  return c.json({ data: result });
});

app.get(
  "/:productId",
  zValidator(
    "param",
    z.object({
      productId: z.uuidv7(),
    })
  ),
  async (c) => {
    const params = c.req.valid("param");
    const productDAO = new ProductDAO(knexInstance);
    const result = await productDAO.queryById(params.productId, {
      sales: true,
      variants: { setting: true, sales: true },
      setting: true,
    });
    return c.json(result);
  }
);

app.post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string().max(100).min(2),
      productCategoryId: z.uuidv7().nullish(),
      settings: productSettingSchema.nullish(),
    })
  ),
  async (c) => {
    const body = c.req.valid("json");
    const uow = new UnitOfWork(knexInstance, repositoryFactory);
    const usecase = new CreateProductUsecase(uow, domainEventBus, idGenerator);
    await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
      await usecase.call({
        accountId: fakeId,
        name: body.name,
        productCategoryId: body.productCategoryId ?? null,
        settings: body.settings ?? undefined,
      });
    });
    c.status(201);
    return c.json({ message: "Successfully created product" });
  }
);

app.delete(
  "/:productId",

  zValidator(
    "param",
    z.object({
      productId: z.uuidv7(),
    })
  ),
  async (c) => {
    const params = c.req.valid("param");
    const uow = new UnitOfWork(knexInstance, repositoryFactory);
    const usecase = new ArchiveProductUsecase(uow);
    await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
      await usecase.call({ productId: params.productId });
    });
    return c.json({ message: "Successfully archived product" });
  }
);
app.patch(
  "/:productId",
  zValidator(
    "param",
    z.object({
      productId: z.uuidv7(),
    })
  ),
  zValidator(
    "json",
    z
      .object({
        name: z.string().max(100).min(2),
        safetyStock: z.number().int().min(0),
        stock: z.number().int().min(0),
        settings: productSettingSchema.partial(),
      })
      .partial()
  ),
  async (c) => {
    const params = c.req.valid("param");
    const body = c.req.valid("json");
    const uow = new UnitOfWork(knexInstance, repositoryFactory);
    const usecase = new UpdateProductUsecase(uow);
    await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
      await usecase.call({
        productId: params.productId,
        fields: {
          name: body.name,
          safetyStock: body.safetyStock,
          stock: body.stock,
          settings: body.settings,
        },
      });
    });
    return c.json({ message: "Successfully updated product" });
  }
);
app.route("/:productId/variants", variantRouter);
app.route("/:productId/sales", saleRouter);

export default app;
