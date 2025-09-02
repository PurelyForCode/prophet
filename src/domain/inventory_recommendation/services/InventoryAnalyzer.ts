import { Delivery } from "../../delivery_management/entities/delivery/Delivery.js";
import { Product } from "../../product_management/entities/product/Product.js";

class InventoryAnalyzer {
  analyze(params: {
    product: Product;
    deliveriesInProgress: Delivery[];
    forecasts: any[];
  }) {}
}
