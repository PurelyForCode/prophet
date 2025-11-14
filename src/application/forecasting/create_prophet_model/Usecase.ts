import { IIdGenerator } from "../../../core/interfaces/IIdGenerator.js"
import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { ProphetModelManager } from "../../../domain/forecasting/services/ProphetModelManager.js"

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
		mode: string
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
		const hasActiveModel =
			await prophetModelRepo.doesProductHaveActiveModel(input.productId)
		const isActive = !hasActiveModel

		const modelManager = new ProphetModelManager()
		const model = modelManager.createProphetModel(
			this.idGenerator.generate(),
			input.productId,
			isActive,
		)
		await this.uow.save(model)
	}
}
