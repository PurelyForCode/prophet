import { ValueException } from "../../../../../core/exceptions/ValueException.js"

export type UpdateProductSettingFields = Partial<{
	serviceLevel: number
	safetyStockCalculationMethod: SafetyStockCalculationMethod
	classification: ProductClassification
	fillRate: number
}>

export type SafetyStockCalculationMethod = "manual" | "dynamic" | "historical"
export type ProductClassification = "fast" | "slow"

export class ProductSetting {
	public readonly serviceLevel: number
	public readonly safetyStockCalculationMethod: SafetyStockCalculationMethod
	public readonly classification: ProductClassification
	public readonly fillRate: number
	public readonly updatedAt: Date

	constructor(
		serviceLevel: number,
		safetyStockCalculationMethod: string,
		classification: string,
		fillRate: number,
		updatedAt: Date,
	) {
		if (serviceLevel > 100 || serviceLevel < 80) {
			throw new ValueException("Service level should be within 80-100")
		}
		this.serviceLevel = serviceLevel
		if (
			safetyStockCalculationMethod === "dynamic" ||
			safetyStockCalculationMethod === "historical" ||
			safetyStockCalculationMethod === "manual"
		) {
			this.safetyStockCalculationMethod = safetyStockCalculationMethod
		} else {
			throw new ValueException(
				`Product safety stock calculation method is invalid, only "historical", "dynamic", or "manual" is allowed`,
			)
		}
		if (classification === "fast" || classification == "slow") {
			this.classification = classification
		} else {
			throw new ValueException(
				`Product classification can only be "fast", or "slow"`,
			)
		}

		if (fillRate > 100 || fillRate < 80) {
			throw new ValueException("Service level should be within 80-100")
		} else {
			this.fillRate = fillRate
		}
		this.updatedAt = updatedAt
	}

	public static defaultConfiguration(now: Date): ProductSetting {
		return new ProductSetting(90, "dynamic", "fast", 90, now)
	}
}
