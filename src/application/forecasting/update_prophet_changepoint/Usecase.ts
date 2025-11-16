import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { ProphetChangepointNotFoundException } from "../../../domain/forecasting/exceptions/ProphetChangepointNotFoundException.js"
import { ProphetModelNotFoundException } from "../../../domain/forecasting/exceptions/ProphetModelNotFoundException.js"
import { ProductGroupNotFoundException } from "../../../domain/product_management/exceptions/ProductGroupNotFoundException.js"
import { ProductNotFoundException } from "../../../domain/product_management/exceptions/ProductNotFoundException.js"

type UpdateProphetChangepointInput = {
	groupId: string
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
		if (!prophetModel || prophetModel.productId === input.productId) {
			throw new ProphetModelNotFoundException()
		}

		const changepoint = prophetModel.getChangepoint(input.changepointId)
		if (!changepoint) {
			throw new ProphetChangepointNotFoundException()
		}
		prophetModel.updateChangepoint(changepoint.id, input.date)
		await this.uow.save(prophetModel)
	}
}
