import { Hono } from "hono";
import { GenerateSaleForecastUsecase } from "../../features/sales_forecasting/generate_sale_forecast/Usecase.js";
import { UnitOfWork } from "../../infra/utils/UnitOfWork.js";
import { knexInstance } from "../../config/Knex.js";
import { repositoryFactory } from "../../infra/utils/RepositoryFactory.js";
import { domainEventBus } from "../../infra/events/EventBusConfiguration.js";

const app = new Hono();

// forecast everything
app.post("/", (c) => {
  const uow = new UnitOfWork(knexInstance, repositoryFactory);
  const usecase = new GenerateSaleForecastUsecase(uow, domainEventBus);
  return c.json({});
});

// When should you forecast?
// 1. When prompted by the owner to forecast everything
// 2. Seasonally
