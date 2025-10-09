import { SingleForecastGeneratedDomainEvent } from "../../domain/sales_forecasting/events/SingleForecastGenerated.js"
import { EventBus } from "./DomainEventBus.js"
import { IncrementProductSalesCountEventHandler } from "./handlers/sales/sale_created/IncrementProductSalesCountEventHandler.js"

export const domainEventBus = new EventBus()
