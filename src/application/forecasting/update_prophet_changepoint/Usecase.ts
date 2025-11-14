import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { ProphetChangepointNotFoundException } from "../../../domain/forecasting/exceptions/ProphetChangepointNotFoundException.js"
import { ProphetModelNotFoundException } from "../../../domain/forecasting/exceptions/ProphetModelNotFoundException.js"

type UpdateProphetChangepointInput = {
	productId: string
	prophetModelId: string
	changepointId: string
	date: Date
}

export class UpdateProphetModelUsecase
	implements Usecase<UpdateProphetChangepointInput, any>
{
	constructor(private uow: IUnitOfWork) {}
	async call(input: UpdateProphetChangepointInput) {
		const prophetModelRepo = this.uow.getProphetModelRepository()
		const prophetModel = await prophetModelRepo.findById(
			input.prophetModelId,
		)
		if (!prophetModel || prophetModel.productId === input.productId) {
			throw new ProphetModelNotFoundException()
		}

		const changepoint = prophetModel.getChangepoint(input.changepointId)
		if (!changepoint) {
			throw new ProphetChangepointNotFoundException()
		}

		changepoint.changepointDate = input.date
		prophetModel.updateChangepoint()
		await this.uow.save(model)
	}
}
