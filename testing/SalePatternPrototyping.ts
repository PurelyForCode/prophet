import { fakeId } from "../src/fakeId.js"
import { idGenerator } from "../src/infra/utils/IdGenerator.js"
import { runInTransaction, UnitOfWork } from "../src/infra/utils/UnitOfWork.js"
import { knexInstance } from "../src/config/Knex.js"
import { repositoryFactory } from "../src/infra/utils/RepositoryFactory.js"
import {
	CreateSaleInput,
	CreateSaleUsecase,
} from "../src/application/sales_management/create_sale/Usecase.js"
import { domainEventBus } from "../src/infra/events/EventBusConfiguration.js"
import { IsolationLevel } from "../src/core/interfaces/IUnitOfWork.js"
interface Pattern {
	generate(day: number, totalDays: number): number
}

export class LinearPattern implements Pattern {
	private min: number
	private max: number

	constructor(config: { min: number; max: number }) {
		if (config.min < 0) throw new Error("min must be non-negative")
		this.min = config.min
		this.max = config.max
	}

	generate(day: number, totalDays: number) {
		if (totalDays <= 1) return Math.round(this.max)
		return Math.round(
			this.min + ((this.max - this.min) / (totalDays - 1)) * day,
		)
	}
}

export class SeasonalPattern implements Pattern {
	private min: number
	private max: number
	private cycleLength: number
	private amplitude?: number

	constructor(config: {
		min: number
		max: number
		cycleLength?: number
		amplitude?: number
	}) {
		if (config.min < 0) throw new Error("min must be non-negative")
		this.min = config.min
		this.max = config.max
		this.cycleLength = config.cycleLength ?? 7
		this.amplitude = config.amplitude
	}

	generate(day: number, totalDays: number) {
		const midpoint = (this.max + this.min) / 2
		const amp = this.amplitude ?? (this.max - this.min) / 2
		const qty =
			midpoint + amp * Math.sin((2 * Math.PI * day) / this.cycleLength)
		return Math.round(Math.max(this.min, Math.min(this.max, qty)))
	}
}

export class SCurvePattern implements Pattern {
	private min: number
	private max: number
	private midpoint: number
	private steepness: number

	constructor(config: {
		min: number
		max: number
		midpoint: number
		steepness?: number
	}) {
		if (config.min < 0) throw new Error("min must be non-negative")
		this.min = config.min
		this.max = config.max
		this.midpoint = config.midpoint
		this.steepness = config.steepness ?? 0.3
	}

	generate(day: number, totalDays: number) {
		const normalized =
			1 / (1 + Math.exp(-this.steepness * (day - this.midpoint)))
		const qty = this.min + (this.max - this.min) * normalized
		return Math.round(Math.max(this.min, Math.min(this.max, qty)))
	}
}

export class RandomSpikesPattern implements Pattern {
	private min: number
	private max: number
	private spikeChance: number
	private spikeAmount: number

	constructor(config: {
		min: number
		max: number
		spikeChance?: number
		spikeAmount?: number
	}) {
		if (config.min < 0) throw new Error("min must be non-negative")
		this.min = config.min
		this.max = config.max
		this.spikeChance = config.spikeChance ?? 0.1
		this.spikeAmount = config.spikeAmount ?? (this.max - this.min) * 2
	}

	generate(day: number, totalDays: number) {
		let qty = this.min + Math.random() * (this.max - this.min)
		if (Math.random() < this.spikeChance)
			qty += this.spikeAmount * Math.random() // variable spike
		qty = Math.min(this.max + this.spikeAmount, qty)
		return Math.round(qty)
	}
}

export class StablePattern implements Pattern {
	private min: number

	constructor(config: { min: number }) {
		if (config.min < 0) throw new Error("min must be non-negative")
		this.min = config.min
	}

	generate(day: number, totalDays: number) {
		const jitter = Math.random() * 2 - 1 // ±1 fluctuation
		return Math.round(Math.max(0, this.min + jitter))
	}
}

interface PatternSegment<P extends Pattern = Pattern> {
	days: number
	pattern: P
}

export async function generateSalesData(
	groupId: string,
	productId: string,
	patternSequence: PatternSegment[],
) {
	const now = new Date()
	let dayCounter = 0
	const totalDays = patternSequence.reduce((a, c) => a + c.days, 0)

	const inputs: CreateSaleInput[] = []

	for (const { days, pattern } of patternSequence) {
		for (let i = 0; i < days; i++) {
			dayCounter++
			const qty = pattern.generate(i, days)

			const date = new Date(now)
			date.setDate(now.getDate() - (totalDays - dayCounter))
			date.setHours(0, 0, 0, 0)

			inputs.push({
				accountId: fakeId,
				date,
				groupId,
				productId,
				quantity: qty,
				status: "completed",
			})
		}
	}

	for (const input of inputs) {
		const uow = new UnitOfWork(knexInstance, repositoryFactory)
		const usecase = new CreateSaleUsecase(uow, idGenerator, domainEventBus)
		await runInTransaction(uow, IsolationLevel.READ_COMMITTED, async () => {
			await usecase.call(input)
		})
	}
}
