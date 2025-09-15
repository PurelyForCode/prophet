import { Hono } from "hono";
import { CreateCategoryUsecase } from "../../application/product_management/category/create_category/Usecase.js";
import { runInTransaction, UnitOfWork } from "../../infra/utils/UnitOfWork.js";
import { knexInstance } from "../../config/Knex.js";
import { repositoryFactory } from "../../infra/utils/RepositoryFactory.js";
import { domainEventBus } from "../../infra/events/EventBusConfiguration.js";
import { idGenerator } from "../../infra/utils/IdGenerator.js";
import { IsolationLevel } from "../../core/interfaces/IUnitOfWork.js";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { UpdateCategoryUsecase } from "../../application/product_management/category/update_category/Usecase.js";
import { ArchiveCategoryUsecase } from "../../application/product_management/category/archive_category/Usecase.js";
import { AddProductInCategoryUsecase } from "../../application/product_management/category/add_product_in_category/Usecase.js";

const app = new Hono();

app.get("/", async (c) => {
  const data = null;
  return c.json({ data: data });
});

app.post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string().max(100).min(2),
      accountId: z.uuidv7(),
    })
  ),
  async (c) => {
    const uow = new UnitOfWork(knexInstance, repositoryFactory);
    const usecase = new CreateCategoryUsecase(uow, domainEventBus, idGenerator);
    const body = c.req.valid("json");
    await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
      await usecase.call({ accountId: body.accountId, name: body.name });
    });
    return c.json({ message: "Successfully created category" });
  }
);

app.patch(
  "/:categoryId",
  zValidator(
    "json",
    z.object({
      name: z.string().max(100).min(2),
    })
  ),
  zValidator(
    "param",
    z.object({
      categoryId: z.uuidv7(),
    })
  ),
  async (c) => {
    const uow = new UnitOfWork(knexInstance, repositoryFactory);
    const usecase = new UpdateCategoryUsecase(uow, domainEventBus);
    const body = c.req.valid("json");
    const params = c.req.valid("param");
    await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
      await usecase.call({ categoryId: params.categoryId, name: body.name });
    });
    return c.json({ message: "Successfully updated category" });
  }
);

app.delete(
  "/:categoryId",
  zValidator(
    "json",
    z.object({
      name: z.string().max(100).min(2),
    })
  ),
  zValidator(
    "param",
    z.object({
      categoryId: z.uuidv7(),
    })
  ),
  async (c) => {
    const uow = new UnitOfWork(knexInstance, repositoryFactory);
    const usecase = new ArchiveCategoryUsecase(uow, domainEventBus);
    const body = c.req.valid("json");
    const params = c.req.valid("param");
    await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
      await usecase.call({ categoryId: params.categoryId });
    });
    return c.json({ message: "Successfully archived category" });
  }
);

app.post(
  "/:categoryId/products",
  zValidator(
    "json",
    z.object({
      productId: z.uuidv7(),
    })
  ),
  zValidator(
    "param",
    z.object({
      categoryId: z.uuidv7(),
    })
  ),
  async (c) => {
    const uow = new UnitOfWork(knexInstance, repositoryFactory);
    const usecase = new AddProductInCategoryUsecase(uow, domainEventBus);
    const body = c.req.valid("json");
    const params = c.req.valid("param");
    await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
      await usecase.call({
        categoryId: params.categoryId,
        productId: body.productId,
      });
    });
    return c.json({ message: "Successfully added product to category" });
  }
);

app.post(
  "/:categoryId/products/:productId",
  zValidator(
    "param",
    z.object({
      categoryId: z.uuidv7(),
      productId: z.uuidv7(),
    })
  ),
  async (c) => {
    const uow = new UnitOfWork(knexInstance, repositoryFactory);
    const usecase = new AddProductInCategoryUsecase(uow, domainEventBus);
    const params = c.req.valid("param");
    await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
      await usecase.call({
        categoryId: params.categoryId,
        productId: params.productId,
      });
    });
    return c.json({ message: "Successfully removed product to category" });
  }
);
export default app;
