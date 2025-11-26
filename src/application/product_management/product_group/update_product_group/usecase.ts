import { IIdGenerator } from "../../../../core/interfaces/IIdGenerator.js"
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../../core/interfaces/Usecase.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { UpdateProductFields } from "../../../../domain/product_management/entities/product/Product.js"
import { ProductName } from "../../../../domain/product_management/entities/product/value_objects/ProductName.js"
import { ProductSetting } from "../../../../domain/product_management/entities/product/value_objects/ProductSetting.js"
import { ProductGroupNotFoundException } from "../../../../domain/product_management/exceptions/ProductGroupNotFoundException.js"
import { ProductGroupManager } from "../../../../domain/product_management/services/ProductGroupManager.js"

type UpdateProductGroupInput = {
	id: EntityId
	fields: Partial<{
		name: string
	}>
}

export class UpdateProductGroupUsecase
	implements Usecase<UpdateProductGroupInput>
{
	constructor(private uow: IUnitOfWork) {}
	async call(input: UpdateProductGroupInput): Promise<void> {
		const groupRepo = this.uow.getProductGroupRepository()
		const group = await groupRepo.findById(input.id)
		if (!group) {
			throw new ProductGroupNotFoundException()
		}
		const productGroupManager = new ProductGroupManager()
		let fields: UpdateProductFields = {}
		if (input.fields.name) {
			fields.name = new ProductName(input.fields.name)
		}
		const updatedGroup = await productGroupManager.updateProductGroup(
			groupRepo,
			fields,
			group,
		)
		await this.uow.save(updatedGroup)
	}
}
