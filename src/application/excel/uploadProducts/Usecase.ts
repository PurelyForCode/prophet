import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { EntityId } from "../../../core/types/EntityId.js"

type CreateInventoryRecommendationInput = {
	forecastId: EntityId
	coverageDays: number
}

export class UploadProductsUsecase implements Usecase<any, any> {
	constructor(private readonly uow: IUnitOfWork) {}
	async call(input: any): Promise<void> {}
}
