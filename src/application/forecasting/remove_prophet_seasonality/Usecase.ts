import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { ProphetModelNotFoundException } from "../../../domain/forecasting/exceptions/ProphetModelNotFoundException.js"

type RemoveProphetSeasonalityInput = {
	productId: string
	prophetModelId: string
	seasonalityId: string
}

export class RemoveProphetSeasonalityUsecase
	implements Usecase<RemoveProphetSeasonalityInput, any>
{
	constructor(private uow: IUnitOfWork) {}

	async call(input: RemoveProphetSeasonalityInput) {
		const prophetModelRepo = this.uow.getProphetModelRepository()
		const prophetModel = await prophetModelRepo.findById(
			input.prophetModelId,
		)
		if (!prophetModel || prophetModel.productId !== input.productId) {
			throw new ProphetModelNotFoundException()
		}
		prophetModel.removeSeasonality(input.seasonalityId)
		await this.uow.save(prophetModel)
	}
}
