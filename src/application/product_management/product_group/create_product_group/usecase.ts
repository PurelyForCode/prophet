import { IIdGenerator } from "../../../../core/interfaces/IIdGenerator.js"
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../../core/interfaces/Usecase.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { ProductName } from "../../../../domain/product_management/entities/product/value_objects/ProductName.js"
import { ProductSetting } from "../../../../domain/product_management/entities/product/value_objects/ProductSetting.js"
import { ProductGroupManager } from "../../../../domain/product_management/services/ProductGroupManager.js"

type CreateProductGroupInput = {
	accountId: EntityId
	categoryId: EntityId | null
	name: string
	setting: null | {
		fillRate: number
		safetyStockCalculationMethod: string
		serviceLevel: number
		classification: string
	}
}

export class CreateProductGroupUsecase
	implements Usecase<CreateProductGroupInput>
{
	constructor(
		private uow: IUnitOfWork,
		private idGenerator: IIdGenerator,
	) {}
	async call(input: CreateProductGroupInput): Promise<void> {
		const productGroupRepo = this.uow.getProductGroupRepository()
		const productGroupManager = new ProductGroupManager()
		const now = new Date()
		let setting: ProductSetting | undefined = undefined
		if (input.setting) {
			setting = new ProductSetting(
				input.setting.serviceLevel,
				input.setting.safetyStockCalculationMethod,
				input.setting.classification,
				input.setting.fillRate,
				now,
			)
		}
		const productGroup = await productGroupManager.createProductGroup(
			productGroupRepo,
			{
				accountId: input.accountId,
				now: now,
				productCategoryId: input.categoryId,
				productGroupId: this.idGenerator.generate(),
				productGroupName: new ProductName(input.name),
				productId: this.idGenerator.generate(),
				settings: setting,
			},
		)
		await this.uow.save(productGroup)
	}
}
