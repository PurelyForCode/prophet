import { GenerateInventoryRecommendationHandler } from "../../application/inventory_recommendation/handlers/forecast_generated/GenerateInventoryRecommendation.js"
import { DecrementProductStockHandler } from "../../domain/product_management/handlers/DecrementProductStockHandler.js"
import { DeliveryCompletedHandler } from "../../domain/product_management/handlers/DeliveryCompletedHandler.js"
import { IncrementProductStockHandler } from "../../domain/product_management/handlers/IncrementProductStockHandler.js"
import { RemoveDeliveredStockHandler } from "../../domain/product_management/handlers/RemoveDeliveredStockHandler.js"
import { EventBus } from "./DomainEventBus.js"
import { IncrementProductSalesCountHandler } from "./handlers/sales/sale_created/IncrementProductSalesCountEventHandler.js"

export const domainEventBus = new EventBus()

domainEventBus.register(new IncrementProductSalesCountHandler())
domainEventBus.register(new GenerateInventoryRecommendationHandler())
domainEventBus.register(new IncrementProductStockHandler())
domainEventBus.register(new DecrementProductStockHandler())
domainEventBus.register(new DeliveryCompletedHandler())
domainEventBus.register(new RemoveDeliveredStockHandler())
