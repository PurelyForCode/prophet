import { IIdGenerator } from "../../../core/interfaces/IIdGenerator.js"
import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { StandardName } from "../../../core/value_objects/StandardName.js"
import { ProphetHoliday } from "../../../domain/forecasting/entities/prophet_model_holiday/ProphetHoliday.js"
import { ProphetModelNotFoundException } from "../../../domain/forecasting/exceptions/ProphetModelNotFoundException.js"

type AddProphetHolidayInput = {
	productId: string
	prophetModelId: string
	holidays: {
		name: string
		ds: Date[]
		lowerWindow: number
		upperWindow: number
	}
}

export class AddProphetHolidayUsecase
	implements Usecase<AddProphetHolidayInput, any>
{
	constructor(
		private uow: IUnitOfWork,
		private idGenerator: IIdGenerator,
	) {}
	async call(input: AddProphetHolidayInput) {
		const prophetModelRepo = this.uow.getProphetModelRepository()
		const prophetModel = await prophetModelRepo.findById(
			input.prophetModelId,
		)

		if (!prophetModel || prophetModel.productId !== input.productId) {
			throw new ProphetModelNotFoundException()
		}

		const holiday = ProphetHoliday.create({
			id: this.idGenerator.generate(),
			modelSettingId: prophetModel.id,
			name: new StandardName(input.holidays.name, "holiday name"),
			date: input.holidays.ds,
			lowerWindow: input.holidays.lowerWindow,
			upperWindow: input.holidays.upperWindow,
		})

		prophetModel.addHoliday(holiday)
		await this.uow.save(prophetModel)
	}
}
