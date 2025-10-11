import { Product } from "../../product_management/entities/product/Product.js"
import { Forecast } from "../../sales_forecasting/entities/forecast/Forecast.js"
import { ProductDelivery } from "../value_objects/ProductDelivery.js"

export class ForecastAnalyzer {
	constructor() {}

	analyze(
		product: Product,
		forecast: Forecast,
		deliveries: ProductDelivery[],
	) {}
}
