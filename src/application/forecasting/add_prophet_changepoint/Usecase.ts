import { IIdGenerator } from "../../../core/interfaces/IIdGenerator.js"
import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { ProphetChangepoint } from "../../../domain/forecasting/entities/prophet_model_changepoint/ProphetChangepoint.js"
import { ProphetModelNotFoundException } from "../../../domain/forecasting/exceptions/ProphetModelNotFoundException.js"

type AddProphetChangepointInput = {
	productId: string
	prophetModelId: string
	changepoints: Date[]
}

export class AddProphetChangepointUsecase
	implements Usecase<AddProphetChangepointInput, any>
{
	constructor(
		private uow: IUnitOfWork,
		private idGenerator: IIdGenerator,
	) {}
	async call(input: AddProphetChangepointInput) {
		const prophetModelRepo = this.uow.getProphetModelRepository()
		const prophetModel = await prophetModelRepo.findById(
			input.prophetModelId,
		)

		if (!prophetModel || prophetModel.productId !== input.productId) {
			throw new ProphetModelNotFoundException()
		}
		for (const date of input.changepoints) {
			const changepoint = ProphetChangepoint.create({
				id: this.idGenerator.generate(),
				modelSettingId: prophetModel.id,
				changepointDate: date,
			})
			prophetModel.addChangepoint(changepoint)
		}
		await this.uow.save(prophetModel)
	}
}
