import { Hono } from "hono";
import { runInTransaction, UnitOfWork } from "../../infra/utils/UnitOfWork.js";
import { knexInstance } from "../../config/Knex.js";
import { repositoryFactory } from "../../infra/utils/RepositoryFactory.js";
import { idGenerator } from "../../infra/utils/IdGenerator.js";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import saleRouter from "./SaleRouter.js";
import { fakeId } from "../../fakeId.js";
import { CreateVariantUsecase } from "../../features/product_management/variant/create_variant/Usecase.js";
import { UpdateVariantUsecase } from "../../features/product_management/variant/update_variant/Usecase.js";
import { IsolationLevel } from "../../core/interfaces/IUnitOfWork.js";
import { VariantDAO } from "../../infra/dao/VariantDAO.js";

const app = new Hono();

app.get(
  "/",
  zValidator(
    "param",
    z.object({
      productId: z.uuidv7(),
    })
  ),
  async (c) => {
    const params = c.req.valid("param");
    const variantDAO = new VariantDAO(knexInstance);
    const variant = await variantDAO.query(
      { productId: params.productId },
      { sales: true, setting: true }
    );
    return c.json({ data: variant });
  }
);
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
// app.delete("/:variantId", async (c) => {
//   //
// });
app.patch(
  "/:variantId",
  zValidator(
    "json",
    z
      .object({
        name: z.string().max(100).min(1),
        safetyStock: z.int().positive(),
        stock: z.int().positive(),
        settings: z
          .object({
            classification: z.enum([]),
            fillRate: z.int().positive().min(80).max(100),
            safetyStockCalculationMethod: z.enum([]),
            serviceLevel: z.int().positive().min(80).max(100),
          })
          .partial(),
      })
      .partial()
  ),
  zValidator(
    "param",
    z.object({
      productId: z.uuidv7(),
      varaintId: z.uuidv7(),
    })
  ),
  async (c) => {
    const body = c.req.valid("json");
    const params = c.req.valid("param");
    const uow = new UnitOfWork(knexInstance, repositoryFactory);
    const usecase = new UpdateVariantUsecase(uow);

    runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
      await usecase.call({
        fields: {
          name: body.name,
          safetyStock: body.safetyStock,
          settings: body.settings,
          stock: body.stock,
        },
        productId: params.productId,
        variantId: params.varaintId,
      });
    });
    return c.json({ message: "Successfully updated variant" });
  }
);

app.get(
  "/:variantId",
  zValidator(
    "param",
    z.object({
      productId: z.uuidv7(),
      variantId: z.uuidv7(),
    })
  ),
  async (c) => {
    const params = c.req.valid("param");
    const variantDAO = new VariantDAO(knexInstance);
    const variant = await variantDAO.queryOneFromProduct(
      params.variantId,
      params.productId,
      {
        sales: true,
        setting: true,
      }
    );
    return c.json({ data: variant });
  }
);

app.route("/sales", saleRouter);

export default app;
