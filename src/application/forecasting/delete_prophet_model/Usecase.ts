import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { ProphetModelNotFoundException } from "../../../domain/forecasting/exceptions/ProphetModelNotFoundException.js"
import { ProphetModelManager } from "../../../domain/forecasting/services/ProphetModelManager.js"
import { ProductGroupNotFoundException } from "../../../domain/product_management/exceptions/ProductGroupNotFoundException.js"
import { ProductNotFoundException } from "../../../domain/product_management/exceptions/ProductNotFoundException.js"

type DeleteProphetModelInput = {
	groupId: string
	productId: string
	prophetModelId: string
}

export class DeleteProphetModelUsecase
	implements Usecase<DeleteProphetModelInput, any>
{
	constructor(private uow: IUnitOfWork) {}
	async call(input: DeleteProphetModelInput) {
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
		const modelManager = new ProphetModelManager()
		modelManager.deleteProphetModel(prophetModel)
		await this.uow.save(prophetModel)
	}
}
