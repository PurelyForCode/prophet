import { Supplier } from "../../delivery_management/entities/supplier/Supplier.js"
import { Product } from "../../product_management/entities/product/Product.js"
import { Forecast } from "../../forecasting/entities/forecast/Forecast.js"
import { ForecastEntry } from "../../forecasting/entities/forecast_entry/ForecastEntry.js"
import { ProductDelivery } from "../value_objects/ProductDelivery.js"
import { InventoryRecommendation } from "../entities/inventory_recommendation/InventoryRecommendation.js"
import { EntityId } from "../../../core/types/EntityId.js"

type RestockStrategyValues = "minimal" | "safe" | "aggressive"

export class InventoryRecommendationGenerator {
	constructor() {}

	private computeSafetyStock(
		product: Product,
		forecastEntries: ForecastEntry[],
		defaultSupplier: Supplier,
	): number {
		const leadTime = defaultSupplier.getLeadTime().value
		const serviceLevel = product.settings.serviceLevel ?? 0.95
		const zTable: Record<number, number> = {
			0.9: 1.28,
			0.95: 1.65,
			0.975: 1.96,
			0.99: 2.33,
		}

		const z = zTable[serviceLevel] ?? 1.65

		// Helper for mean and std
		const mean = (arr: number[]) =>
			arr.reduce((s, x) => s + x, 0) / (arr.length || 1)
		const std = (arr: number[]) => {
			const m = mean(arr)
			const variance =
				arr.reduce((s, x) => s + (x - m) ** 2, 0) / (arr.length || 1)
			return Math.sqrt(variance)
		}

		let sigmaD = 0 // daily demand std deviation

		// === Dynamic prophet-based safety stock ===
		// Approximate σ from Prophet’s 95% CI
		const avgDailyStd =
			forecastEntries.reduce((sum, entry) => {
				const dailyStd = (entry.yhatUpper - entry.yhatLower) / 3.92 // more precise than /4
				return sum + dailyStd
			}, 0) / forecastEntries.length
		sigmaD = avgDailyStd

		// Safety stock = z * σ * sqrt(leadTime)
		const safetyStock = Math.ceil(z * sigmaD * Math.sqrt(leadTime))
		return safetyStock
	}

	generate(
		inventoryRecommendationId: EntityId,
		product: Product,
		forecast: Forecast,
		deliveries: ProductDelivery[],
		defaultSupplier: Supplier,
		userPreference: {
			restockStrategy: RestockStrategyValues
		},
	): InventoryRecommendation | null {
		let currentStock = product.stock.value

		const forecastEntries = [...forecast.entries.values()].sort(
			(a, b) => a.date.getTime() - b.date.getTime(),
		)

		const deliveriesByDate = deliveries.reduce<Record<string, number>>(
			(acc, delivery) => {
				const key = delivery.arrivalDate.toISOString().split("T")[0]
				acc[key] = (acc[key] ?? 0) + delivery.quantity
				return acc
			},
			{},
		)

		const forecastDays = forecastEntries.map((entry) => {
			const key = entry.date.toISOString().split("T")[0]
			const deliveriesForDay = deliveriesByDate[key] ?? 0
			return {
				date: entry.date,
				forecast: entry,
				deliveries: deliveriesForDay,
			}
		})

		let runsOutAt: Date | null = null
		for (const forecastDay of forecastDays) {
			currentStock += forecastDay.deliveries
			currentStock -= forecastDay.forecast.yhat
			if (currentStock <= 0) {
				runsOutAt = forecastDay.date
				break
			}
		}

		if (!runsOutAt) {
			return null
		}

		const leadTime = defaultSupplier.getLeadTime().value
		let restockAt = new Date(runsOutAt)
		restockAt.setDate(restockAt.getDate() - leadTime)

		const restockArrivalDate = new Date(restockAt)
		restockArrivalDate.setDate(restockArrivalDate.getDate() + leadTime)
		const cutOffDate = new Date(restockArrivalDate)

		if (userPreference.restockStrategy === "minimal") {
			cutOffDate.setDate(restockArrivalDate.getDate() + leadTime)
		} else if (userPreference.restockStrategy === "safe") {
			cutOffDate.setDate(restockArrivalDate.getDate() + 14)
		} else if (userPreference.restockStrategy === "aggressive") {
			cutOffDate.setDate(
				forecastDays[forecastDays.length - 1].date.getDate(),
			)
		}

		const demandTillCutOff = forecastEntries
			.filter(
				(entry) =>
					entry.date >= restockArrivalDate &&
					entry.date <= cutOffDate,
			)
			.reduce((sum, entry) => sum + entry.yhat, 0)

		const safetyStock = this.computeSafetyStock(
			product,
			forecastEntries,
			defaultSupplier,
		)

		const restockAmount = demandTillCutOff + safetyStock
		const now = new Date()

		return InventoryRecommendation.create(
			inventoryRecommendationId,
			forecast.id,
			defaultSupplier.id,
			defaultSupplier.getLeadTime(),
			runsOutAt,
			restockAt,
			restockAmount,
			coverageDays,
			now,
			now,
		)
	}
}
