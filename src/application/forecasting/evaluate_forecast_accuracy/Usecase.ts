import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { ForecastQueryDao } from "../../../infra/db/query_dao/ForecastQueryDao.js"
import { ForecastEntryQueryDao } from "../../../infra/db/query_dao/ForecastEntryQueryDao.js"
import { SaleQueryDao, SummedSaleQueryDto } from "../../../infra/db/query_dao/SaleQueryDao.js"
import { Knex } from "knex"
import { ForecastNotFoundException } from "../../../domain/forecasting/exceptions/ForecastNotFoundException.js"

type EvaluateForecastAccuracyInput = {
	forecastId: EntityId
}

type AccuracyMetrics = {
	forecastId: string
	productId: string
	meanAbsoluteError: number
	meanAbsolutePercentageError: number
	rootMeanSquaredError: number
	evaluatedDays: number
	forecastStartDate: Date
	forecastEndDate: Date
	comparisonDetails: Array<{
		date: Date
		forecastedValue: number
		actualValue: number
		absoluteError: number
		percentageError: number
	}>
}

/**
 * Evaluates forecast accuracy by comparing forecasted values with actual historical sales
 * 
 * This usecase:
 * 1. Retrieves a forecast and its entries
 * 2. Compares forecasted values with actual historical sales for the same period
 * 3. Calculates error metrics:
 *    - Mean Absolute Error (MAE)
 *    - Mean Absolute Percentage Error (MAPE)
 *    - Root Mean Squared Error (RMSE)
 * 4. Returns detailed comparison for analysis
 */
export class EvaluateForecastAccuracyUsecase
	implements Usecase<EvaluateForecastAccuracyInput, AccuracyMetrics>
{
	constructor(
		private readonly knex: Knex,
		private readonly uow: IUnitOfWork,
	) {}

	async call(
		input: EvaluateForecastAccuracyInput,
	): Promise<AccuracyMetrics> {
		const forecastQueryDao = new ForecastQueryDao(this.knex)
		const forecastEntryQueryDao = new ForecastEntryQueryDao(this.knex)
		const saleQueryDao = new SaleQueryDao(this.knex)

		// Get forecast
		const forecast = await forecastQueryDao.queryById(input.forecastId, {})
		if (!forecast) {
			throw new ForecastNotFoundException()
		}

		// Get forecast entries
		const forecastEntries = await forecastEntryQueryDao.query({
			forecastId: input.forecastId,
		})

		if (forecastEntries.length === 0) {
			throw new Error("No forecast entries found for this forecast")
		}

		// Get actual sales data for the same period
		// We need to aggregate sales by date
		const startDate = new Date(
			Math.min(...forecastEntries.map((e) => e.date.getTime())),
		)
		const endDate = new Date(
			Math.max(...forecastEntries.map((e) => e.date.getTime())),
		)

		// Get all sales in the forecast period
		const allSales = await this.knex("sale")
			.select("date")
			.sum("quantity as quantity")
			.where("product_id", "=", forecast.productId)
			.whereNull("deleted_at")
			.where("status", "=", "completed")
			.whereBetween("date", [startDate, endDate])
			.groupBy("date")

		// Create a map of actual sales by date
		const actualSalesMap = new Map<string, number>()
		for (const sale of allSales) {
			const dateKey = new Date(sale.date).toISOString().split("T")[0]
			actualSalesMap.set(dateKey, Number(sale.quantity))
		}

		// Compare forecast vs actual
		const comparisonDetails: AccuracyMetrics["comparisonDetails"] = []
		let sumAbsoluteError = 0
		let sumSquaredError = 0
		let sumPercentageError = 0
		let validComparisons = 0

		for (const entry of forecastEntries) {
			const dateKey = entry.date.toISOString().split("T")[0]
			const actualValue = actualSalesMap.get(dateKey) || 0
			const forecastedValue = entry.yhat

			const absoluteError = Math.abs(forecastedValue - actualValue)
			const squaredError = Math.pow(forecastedValue - actualValue, 2)
			
			// Calculate percentage error (avoid division by zero)
			let percentageError = 0
			if (actualValue !== 0) {
				percentageError = Math.abs((forecastedValue - actualValue) / actualValue) * 100
			} else if (forecastedValue !== 0) {
				// If actual is 0 but forecast is not, error is 100%
				percentageError = 100
			}

			comparisonDetails.push({
				date: entry.date,
				forecastedValue,
				actualValue,
				absoluteError,
				percentageError,
			})

			sumAbsoluteError += absoluteError
			sumSquaredError += squaredError
			sumPercentageError += percentageError
			validComparisons++
		}

		// Calculate metrics
		const meanAbsoluteError =
			validComparisons > 0 ? sumAbsoluteError / validComparisons : 0
		const meanAbsolutePercentageError =
			validComparisons > 0 ? sumPercentageError / validComparisons : 0
		const rootMeanSquaredError =
			validComparisons > 0
				? Math.sqrt(sumSquaredError / validComparisons)
				: 0

		return {
			forecastId: forecast.id,
			productId: forecast.productId,
			meanAbsoluteError,
			meanAbsolutePercentageError,
			rootMeanSquaredError,
			evaluatedDays: validComparisons,
			forecastStartDate: forecast.forecastStartDate,
			forecastEndDate: forecast.forecastEndDate,
			comparisonDetails: comparisonDetails.sort(
				(a, b) => a.date.getTime() - b.date.getTime(),
			),
		}
	}
}

