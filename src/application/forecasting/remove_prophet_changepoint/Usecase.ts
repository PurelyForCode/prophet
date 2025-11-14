import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { ProphetModelNotFoundException } from "../../../domain/forecasting/exceptions/ProphetModelNotFoundException.js"

type RemoveProphetChangepointInput = {
	productId: string
	prophetModelId: string
	changepointId: string
}

export class RemoveProphetChangepointUsecase
	implements Usecase<RemoveProphetChangepointInput, any>
{
	constructor(private uow: IUnitOfWork) {}

	async call(input: RemoveProphetChangepointInput) {
		const prophetModelRepo = this.uow.getProphetModelRepository()
		const prophetModel = await prophetModelRepo.findById(
			input.prophetModelId,
		)

		if (!prophetModel || prophetModel.productId !== input.productId) {
			throw new ProphetModelNotFoundException()
		}

		prophetModel.removeChangepoint(input.changepointId)
		await this.uow.save(prophetModel)
	}
}
