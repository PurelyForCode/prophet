import { IIdGenerator } from "../../../core/interfaces/IIdGenerator.js"
import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { ProphetModel } from "../../../domain/forecasting/entities/prophet_model/ProphetModel.js"
import { ProphetModelManager } from "../../../domain/forecasting/services/ProphetModelManager.js"

type ArchiveProphetModelInput = {
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

export class ArchiveProphetModelUsecase
	implements Usecase<ArchiveProphetModelInput, any>
{
	constructor(
		private uow: IUnitOfWork,
		private idGenerator: IIdGenerator,
	) {}
	async call(input: ArchiveProphetModelInput) {
		const prophetModelRepo = this.uow.getProphetModelRepository()
		const hasActiveModel =
			await prophetModelRepo.doesProductHaveActiveModel(input.productId)
		const isActive = !hasActiveModel

		const modelManager = new ProphetModelManager()
		modelManager.archivbe()_
		const model = ProphetModel.create(
			this.idGenerator.generate(),
			input.productId,
			null,
			isActive,
			null,
			new Map(),
			new Map(),
			new Map(),
		)
		await this.uow.save(model)
	}
}
