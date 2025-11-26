import { IIdGenerator } from "../../../core/interfaces/IIdGenerator.js"
import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { ProphetChangepoint } from "../../../domain/forecasting/entities/prophet_model_changepoint/ProphetChangepoint.js"
import { ProphetModelNotFoundException } from "../../../domain/forecasting/exceptions/ProphetModelNotFoundException.js"
import { ProductGroupNotFoundException } from "../../../domain/product_management/exceptions/ProductGroupNotFoundException.js"
import { ProductNotFoundException } from "../../../domain/product_management/exceptions/ProductNotFoundException.js"

type AddProphetChangepointInput = {
	groupId: string
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
		const groupRepo = this.uow.getProductGroupRepository()
		const group = await groupRepo.findById(input.groupId)
		if (!group) {
			throw new ProductGroupNotFoundException()
		}
		const product = group.getVariant(input.productId)
		if (!product) {
			throw new ProductNotFoundException()
		}
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
