import { Knex } from "knex";
import { SaleDatabaseTable } from "../src/infra/dao/SaleDAO.js";
import { fakeId } from "../src/fakeId.js";
import { idGenerator } from "../src/infra/utils/IdGenerator.js";
import { knexInstance } from "../src/config/Knex.js";

// Base interface for all patterns
interface Pattern {
  generate(day: number, totalDays: number): number;
}

// 🔵 Linear Growth
export class LinearPattern implements Pattern {
  private min: number;
  private max: number;

  constructor(config: { min: number; max: number }) {
    if (config.min < 0) {
      throw new Error();
    }
    this.min = config.min;
    this.max = config.max;
  }

  generate(day: number, totalDays: number) {
    return Math.round(
      this.min + ((this.max - this.min) / (totalDays - 1)) * day
    );
  }
}

// 🌊 Seasonal Pattern
export class SeasonalPattern implements Pattern {
  private min: number;
  private max: number;
  private cycleLength: number;
  private amplitude?: number;

  constructor(config: {
    min: number;
    max: number;
    cycleLength?: number;
    amplitude?: number;
  }) {
    if (config.min < 0) {
      throw new Error();
    }
    this.min = config.min;
    this.max = config.max;
    this.cycleLength = config.cycleLength ?? 7;
    this.amplitude = config.amplitude;
  }

  generate(day: number, totalDays: number) {
    const amp = this.amplitude ?? (this.max - this.min) / 2;
    const base = this.min + amp;
    const qty = base + amp * Math.sin((2 * Math.PI * day) / this.cycleLength);
    return Math.round(Math.max(this.min, Math.min(this.max, qty)));
  }
}

// 📈 S-Curve (Logistic)
export class SCurvePattern implements Pattern {
  private min: number;
  private max: number;
  private midpoint: number;
  private steepness: number;

  constructor(config: {
    min: number;
    max: number;
    midpoint: number;
    steepness?: number;
  }) {
    if (config.min < 0) {
      throw new Error();
    }
    this.min = config.min;
    this.max = config.max;
    this.midpoint = config.midpoint;
    this.steepness = config.steepness ?? 0.3;
  }

  generate(day: number, totalDays: number) {
    const qty =
      this.max / (1 + Math.exp(-this.steepness * (day - this.midpoint)));
    return Math.round(Math.max(this.min, Math.min(this.max, qty)));
  }
}

// ⚡ Random Spikes
export class RandomSpikesPattern implements Pattern {
  private min: number;
  private max: number;
  private spikeChance: number;
  private spikeAmount: number;

  constructor(config: {
    min: number;
    max: number;
    spikeChance?: number;
    spikeAmount?: number;
  }) {
    if (config.min < 0) {
      throw new Error();
    }
    this.min = config.min;
    this.max = config.max;
    this.spikeChance = config.spikeChance ?? 0.1;
    this.spikeAmount = config.spikeAmount ?? (this.max - this.min) * 2;
  }

  generate(day: number, totalDays: number) {
    let qty = this.min + Math.random() * (this.max - this.min);
    if (Math.random() < this.spikeChance) qty += this.spikeAmount;
    return Math.round(qty);
  }
}

// 📊 Stable Pattern
export class StablePattern implements Pattern {
  private min: number;

  constructor(config: { min: number }) {
    if (config.min < 0) {
      throw new Error();
    }
    this.min = config.min;
  }

  generate(day: number, totalDays: number) {
    const jitter = Math.random() * 2 - 1; // ±1 fluctuation
    return Math.round(this.min + jitter);
  }
}

interface PatternSegment {
  days: number;
  pattern: Pattern;
}

export async function generateSalesData(
  knex: Knex,
  productId: string,
  variantId: string | undefined,
  patternSequence: PatternSegment[],
  opts?: { hasCancelled?: boolean }
) {
  const now = new Date();
  const sales: any[] = [];
  const hasCancelled = opts?.hasCancelled ?? false;

  let dayCounter = 0;
  const totalDays = patternSequence.reduce((a, c) => a + c.days, 0);

  for (const { days, pattern } of patternSequence) {
    for (let i = 0; i < days; i++) {
      dayCounter++;
      const qty = pattern.generate(i, days);

      const date = new Date();
      date.setDate(now.getDate() - (totalDays - dayCounter));

      sales.push({
        account_id: fakeId,
        created_at: now,
        date,
        deleted_at: null,
        id: idGenerator.generate(),
        product_id: productId,
        quantity: qty,
        status: hasCancelled && Math.random() < 0.1 ? "cancelled" : "completed",
        updated_at: now,
        variant_id: variantId,
      });
    }
  }

  await knex<SaleDatabaseTable>("sale").insert(sales);
}
