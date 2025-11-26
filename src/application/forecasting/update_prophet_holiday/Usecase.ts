import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { StandardName } from "../../../core/value_objects/StandardName.js"
import { ProphetModelNotFoundException } from "../../../domain/forecasting/exceptions/ProphetModelNotFoundException.js"
import { ProductGroupNotFoundException } from "../../../domain/product_management/exceptions/ProductGroupNotFoundException.js"
import { ProductNotFoundException } from "../../../domain/product_management/exceptions/ProductNotFoundException.js"

type UpdateProphetHolidayInput = {
	groupId: string
	productId: string
	prophetModelId: string
	holidayId: string
	fields: Partial<{
		name: string
		date: Date[]
		lowerWindow: number
		upperWindow: number
	}>
}

export class UpdateProphetHolidayUsecase
	implements Usecase<UpdateProphetHolidayInput, any>
{
	constructor(private uow: IUnitOfWork) {}
	async call(input: UpdateProphetHolidayInput) {
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
		prophetModel.updateHoliday(input.prophetModelId, {
			date: input.fields.date,
			lowerWindow: input.fields.lowerWindow,
			upperWindow: input.fields.upperWindow,
			name: input.fields.name
				? new StandardName(input.fields.name, "holiday name")
				: undefined,
		})

		await this.uow.save(prophetModel)
	}
}
