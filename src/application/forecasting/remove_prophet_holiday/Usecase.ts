import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { ProphetModelNotFoundException } from "../../../domain/forecasting/exceptions/ProphetModelNotFoundException.js"

type RemoveProphetHolidayInput = {
	productId: string
	prophetModelId: string
	holidayId: string
}

export class RemoveProphetHolidayUsecase
	implements Usecase<RemoveProphetHolidayInput, any>
{
	constructor(private uow: IUnitOfWork) {}

	async call(input: RemoveProphetHolidayInput) {
		const prophetModelRepo = this.uow.getProphetModelRepository()
		const prophetModel = await prophetModelRepo.findById(
			input.prophetModelId,
		)
		if (!prophetModel || prophetModel.productId !== input.productId) {
			throw new ProphetModelNotFoundException()
		}
		prophetModel.removeHoliday(input.holidayId)
		await this.uow.save(prophetModel)
	}
}
