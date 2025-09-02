import { AggregateRoot } from "../../../core/interfaces/AggregateRoot.js";
import { EntityId } from "../../../core/types/EntityId.js";

export class Recommendation extends AggregateRoot {
  private constructor(
    id: EntityId,
    private productId: EntityId,
    private runsOutAt: Date,
    private optimalRestockDate: Date,
    private recommendedRestockAmount: number,
    private createdAt: Date,
    private updatedAt: Date
  ) {
    super(id);
  }

  getProductId() {
    return this.productId;
  }
  getRunsOutAt() {
    return this.runsOutAt;
  }
  getOptimalRestockDate() {
    return this.optimalRestockDate;
  }
  getRecommendedRestockAmount() {
    return this.recommendedRestockAmount;
  }
  getCreatedAt() {
    return this.createdAt;
  }
  getUpdatedAt() {
    return this.updatedAt;
  }

  setProductId(productId: EntityId) {
    this.productId = productId;
  }
  setRunsOutAt(runsOutAt: Date) {
    this.runsOutAt = runsOutAt;
  }
  setOptimalRestockDate(optimalRestockDate: Date) {
    this.optimalRestockDate = optimalRestockDate;
  }
  setRecommendedRestockAmount(recommendedRestockAmount: number) {
    this.recommendedRestockAmount = recommendedRestockAmount;
  }
  setCreatedAt(createdAt: Date) {
    this.createdAt = createdAt;
  }
  setUpdatedAt(updatedAt: Date) {
    this.updatedAt = updatedAt;
  }

  static create(params: {
    id: EntityId;
    productId: EntityId;
    runsOutAt: Date;
    optimalRestockDate: Date;
    recommendedRestockAmount: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return new Recommendation(
      params.id,
      params.productId,
      params.runsOutAt,
      params.optimalRestockDate,
      params.recommendedRestockAmount,
      params.createdAt,
      params.updatedAt
    );
  }
}
