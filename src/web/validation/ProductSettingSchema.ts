import z from "zod"

export const productSettingSchema = z.object({
	classification: z.string(),
	fillRate: z.number().max(100).min(80),
	serviceLevel: z.number().max(100).min(80),
	safetyStockCalculationMethod: z.string(),
})
