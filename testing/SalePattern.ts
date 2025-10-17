import { CreateSaleInput } from "../src/application/sales_management/create_sale/Usecase.js"

// ======================================================
// 1️⃣ Base Pattern Interface
// ======================================================
export interface Pattern {
	generate(day: number, totalDays: number): number
}

export interface PatternSegment {
	name?: string
	days: number
	pattern: Pattern
}

// ======================================================
// 2️⃣ Core Pattern Implementations
// ======================================================
export class LinearPattern implements Pattern {
	constructor(
		private min: number,
		private max: number,
	) {
		if (min < 0) throw new Error("min must be non-negative")
	}

	generate(day: number, totalDays: number): number {
		if (totalDays <= 1) return Math.round(this.max)
		return Math.round(
			this.min + ((this.max - this.min) / (totalDays - 1)) * day,
		)
	}
}

export class SeasonalPattern implements Pattern {
	constructor(
		private min: number,
		private max: number,
		private cycleLength = 7,
		private amplitude?: number,
	) {
		if (min < 0) throw new Error("min must be non-negative")
	}

	generate(day: number): number {
		const midpoint = (this.max + this.min) / 2
		const amp = this.amplitude ?? (this.max - this.min) / 2
		const qty =
			midpoint + amp * Math.sin((2 * Math.PI * day) / this.cycleLength)
		return Math.round(Math.max(this.min, Math.min(this.max, qty)))
	}
}

export class SCurvePattern implements Pattern {
	constructor(
		private min: number,
		private max: number,
		private midpoint: number,
		private steepness = 0.3,
	) {
		if (min < 0) throw new Error("min must be non-negative")
	}

	generate(day: number): number {
		const normalized =
			1 / (1 + Math.exp(-this.steepness * (day - this.midpoint)))
		const qty = this.min + (this.max - this.min) * normalized
		return Math.round(qty)
	}
}

export class RandomSpikesPattern implements Pattern {
	constructor(
		private min: number,
		private max: number,
		private spikeChance = 0.1,
		private spikeAmount?: number,
	) {
		if (min < 0) throw new Error("min must be non-negative")
		this.spikeAmount = spikeAmount ?? (max - min) * 2
	}

	generate(): number {
		let qty = this.min + Math.random() * (this.max - this.min)
		if (Math.random() < this.spikeChance) {
			qty += this.spikeAmount! * Math.random()
		}
		return Math.round(Math.min(this.max + this.spikeAmount!, qty))
	}
}

export class StablePattern implements Pattern {
	constructor(
		private mean: number,
		private jitter = 1,
	) {
		if (mean < 0) throw new Error("mean must be non-negative")
	}

	generate(): number {
		const variation = (Math.random() * 2 - 1) * this.jitter
		return Math.max(0, Math.round(this.mean + variation))
	}
}

// ======================================================
// 3️⃣ Sales Data Generator
// ======================================================
export interface SalesGenerationConfig {
	accountId: string
	productId: string
	groupId: string
	startDate?: Date
	patterns: PatternSegment[]
}

/**
 * Generates synthetic sales data following the given pattern sequence.
 * You can optionally persist using a provided handler (e.g. CreateSaleUsecase).
 */
export async function generateSalesData(
	config: SalesGenerationConfig,
	saveFn?: (sale: CreateSaleInput) => Promise<void>,
) {
	const { accountId, groupId, productId, startDate, patterns } = config
	const totalDays = patterns.reduce((sum, seg) => sum + seg.days, 0)

	const today = startDate ?? new Date()
	today.setHours(0, 0, 0, 0)

	const sales: CreateSaleInput[] = []
	let dayOffset = 0

	for (const segment of patterns) {
		for (let day = 0; day < segment.days; day++) {
			const qty = segment.pattern.generate(day, segment.days)
			const date = new Date(today)
			date.setDate(today.getDate() - (totalDays - (dayOffset + day + 1)))
			date.setHours(0, 0, 0, 0)

			const sale: CreateSaleInput = {
				accountId,
				groupId,
				productId,
				date,
				quantity: qty,
				status: "completed",
			}
			sales.push(sale)

			if (saveFn) await saveFn(sale)
		}
		dayOffset += segment.days
	}

	return sales
}
