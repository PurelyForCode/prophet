import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { StandardName } from "../../../core/value_objects/StandardName.js"
import { ProphetModelNotFoundException } from "../../../domain/forecasting/exceptions/ProphetModelNotFoundException.js"

type UpdateProphetHolidayInput = {
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
