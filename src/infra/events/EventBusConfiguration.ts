import { GenerateInventoryRecommendationDomainHandler } from "../../application/inventory_recommendation/handlers/forecast_generated/GenerateInventoryRecommendation.js"
import { ForecastGeneratedDomainEvent } from "../../domain/forecasting/events/ForecastGeneratedEvent.js"
import { EventBus } from "./DomainEventBus.js"
import { IncrementProductSalesCountEventHandler } from "./handlers/sales/sale_created/IncrementProductSalesCountEventHandler.js"

export const domainEventBus = new EventBus()

domainEventBus.register(new IncrementProductSalesCountEventHandler())
domainEventBus.register(new GenerateInventoryRecommendationDomainHandler())
