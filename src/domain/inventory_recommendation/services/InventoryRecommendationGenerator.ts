import { Supplier } from "../../delivery_management/entities/supplier/Supplier.js"
import { Product } from "../../product_management/entities/product/Product.js"
import { Forecast } from "../../forecasting/entities/forecast/Forecast.js"
import { ForecastEntry } from "../../forecasting/entities/forecast_entry/ForecastEntry.js"
import { ProductDelivery } from "../value_objects/ProductDelivery.js"
import { InventoryRecommendation } from "../entities/inventory_recommendation/InventoryRecommendation.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { ForecastOutOfDateException } from "../exceptions/ForecastOutOfDateException.js"
import { InventoryStatus } from "../entities/inventory_recommendation/value_objects/InventoryStatus.js"
import { EntityAction } from "../../../core/interfaces/AggregateRoot.js"

export class InventoryRecommendationGenerator {
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
		coverageDays: number,
	): InventoryRecommendation | null {
		let currentStock = product.stock.value

		const sortedEntries = [...forecast.entries.values()].sort(
			(a, b) => a.date.getTime() - b.date.getTime(),
		)

		const now = new Date()
		const forecasts = sortedEntries.filter((entry) => entry.date >= now)

		if (forecasts.length === 0) {
			throw new ForecastOutOfDateException()
		}

		const deliveriesByDate = deliveries.reduce<Record<string, number>>(
			(acc, delivery) => {
				const key = delivery.arrivalDate.toISOString().split("T")[0]
				acc[key] = (acc[key] ?? 0) + delivery.quantity
				return acc
			},
			{},
		)

		const forecastDays = forecasts.map((entry) => {
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

		// Determine status
		const daysUntilRunout =
			(runsOutAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)

		let inventoryStatus: InventoryStatus

		if (runsOutAt <= now) {
			inventoryStatus = new InventoryStatus("critical")
		} else if (restockAt <= now && runsOutAt > now) {
			inventoryStatus = new InventoryStatus("urgent")
		} else if (daysUntilRunout <= leadTime + 2) {
			inventoryStatus = new InventoryStatus("warning")
		} else {
			inventoryStatus = new InventoryStatus("good")
		}

		const restockArrivalDate = new Date(restockAt)
		restockArrivalDate.setDate(restockArrivalDate.getDate() + leadTime)
		const cutOffDate = new Date(restockArrivalDate)

		cutOffDate.setDate(restockArrivalDate.getDate() + coverageDays)

		const demandTillCutOff = forecasts
			.filter(
				(entry) =>
					entry.date >= restockArrivalDate &&
					entry.date <= cutOffDate,
			)
			.reduce((sum, entry) => sum + entry.yhat, 0)

		const safetyStock = this.computeSafetyStock(
			product,
			forecasts,
			defaultSupplier,
		)

		const restockAmount = Math.round(demandTillCutOff + safetyStock)

		const invRec = InventoryRecommendation.create(
			inventoryRecommendationId,
			forecast.id,
			defaultSupplier.id,

			defaultSupplier.getLeadTime(),
			inventoryStatus,

			runsOutAt,
			restockAt,
			restockAmount,
			coverageDays,
			now,
			now,
		)
		invRec.addTrackedEntity(invRec, EntityAction.created)
		return invRec
	}
}
