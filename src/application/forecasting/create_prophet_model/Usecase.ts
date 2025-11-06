import { IIdGenerator } from "../../../core/interfaces/IIdGenerator.js"
import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { ProphetModel } from "../../../domain/forecasting/entities/prophet_model/ProphetModel.js"

type CreateProphetModelInput = {
	productId: string
	changepoints: Date[]
	holidays: {
		name: string
		date: Date
		lowerWindow: number
		upperWindow: number
	}[]
	seasons: {
		name: string
		periodDays: number
		fourierOrder: number
		priorScale: number
		mode: number
	}[]
}

export class CreateProphetModelUsecase
	implements Usecase<CreateProphetModelInput, any>
{
	constructor(
		private uow: IUnitOfWork,
		private idGenerator: IIdGenerator,
	) {}
	async call(input: CreateProphetModelInput) {
		const prophetModelRepo = this.uow.getProphetModelRepository()
		const model = ProphetModel.create(
			this.idGenerator.generate(),
			input.productId,
			null,
			true,
			null,
		)
	}
}
