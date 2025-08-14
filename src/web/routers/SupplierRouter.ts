import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { runInTransaction, UnitOfWork } from "../../infra/utils/UnitOfWork.js";
import { knexInstance } from "../../config/Knex.js";
import { repositoryFactory } from "../../infra/utils/RepositoryFactory.js";
import { DomainEventBus } from "../../infra/utils/DomainEventBus.js";
import { CreateSupplierUsecase } from "../../features/delivery_management/supplier/create_supplier/Usecase.js";
import { idGenerator } from "../../infra/utils/IdGenerator.js";
import { IsolationLevel } from "../../core/interfaces/IUnitOfWork.js";
import { fakeId } from "../../fakeId.js";
import { UpdateSupplierUsecase } from "../../features/delivery_management/supplier/update_supplier/Usecase.js";
import { SupplierDAO } from "../../infra/dao/SupplierDAO.js";

const app = new Hono();

app.get("/", async (c) => {
  const supplierDAO = new SupplierDAO(knexInstance);
  const result = await supplierDAO.query(undefined, { productsSupplied: true });
  return c.json({
    data: result,
  });
});

app.post(
  "/",
  zValidator(
    "json",
    z.object({
      leadTime: z.number().int().positive(),
      name: z.string().max(100).min(1),
    })
  ),
  async (c) => {
    const uow = new UnitOfWork(knexInstance, repositoryFactory);
    const eventBus = new DomainEventBus();
    const usecase = new CreateSupplierUsecase(uow, eventBus, idGenerator);
    const body = c.req.valid("json");
    await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
      await usecase.call({
        accountId: fakeId,
        leadTime: body.leadTime,
        name: body.name,
      });
    });
    c.status(201);
    return c.json({
      message: "Successfully created supplier",
    });
  }
);

app.post(
  "/:supplierId",
  zValidator(
    "param",
    z.object({
      supplierId: z.uuidv7(),
    })
  ),
  zValidator(
    "json",
    z
      .object({
        leadTime: z.number().int().positive(),
        name: z.string().max(100).min(1),
      })
      .partial()
  ),
  async (c) => {
    const uow = new UnitOfWork(knexInstance, repositoryFactory);
    const eventBus = new DomainEventBus();
    const usecase = new UpdateSupplierUsecase(uow, eventBus);
    const params = c.req.valid("param");
    const body = c.req.valid("json");
    await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
      await usecase.call({
        fields: body,
        supplierId: params.supplierId,
      });
    });
    c.status(201);
    return c.json({
      message: "Successfully updated supplier",
    });
  }
);

export default app;
