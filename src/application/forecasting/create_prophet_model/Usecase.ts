import { IIdGenerator } from "../../../core/interfaces/IIdGenerator.js"
import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { ProphetModelManager } from "../../../domain/forecasting/services/ProphetModelManager.js"
import { ProductGroupNotFoundException } from "../../../domain/product_management/exceptions/ProductGroupNotFoundException.js"
import { ProductNotFoundException } from "../../../domain/product_management/exceptions/ProductNotFoundException.js"

type CreateProphetModelInput = {
	groupId: string
	productId: string
	name: string
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
		const groupRepo = this.uow.getProductGroupRepository()
		const group = await groupRepo.findById(input.groupId)
		if (!group) {
			throw new ProductGroupNotFoundException()
		}
		const product = group.getVariant(input.productId)
		if (!product) {
			throw new ProductNotFoundException()
		}
		const hasActiveModel =
			await prophetModelRepo.doesProductHaveActiveModel(input.productId)
		const isActive = !hasActiveModel

		const modelManager = new ProphetModelManager()
		const model = modelManager.createProphetModel(
			this.idGenerator.generate(),
			input.productId,
			isActive,
			input.name,
		)
		await this.uow.save(model)
	}
}
