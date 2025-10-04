import { IIdGenerator } from "../../../../core/interfaces/IIdGenerator.js"
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../../core/interfaces/Usecase.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { UpdateProductFields } from "../../../../domain/product_management/entities/product/Product.js"
import { ProductName } from "../../../../domain/product_management/entities/product/value_objects/ProductName.js"
import { ProductSetting } from "../../../../domain/product_management/entities/product/value_objects/ProductSetting.js"
import { ProductGroupNotFoundException } from "../../../../domain/product_management/exceptions/ProductGroupNotFoundException.js"
import { ProductGroupManager } from "../../../../domain/product_management/services/ProductGroupManager.js"

type ArchiveProductGroupInput = {
	id: EntityId
}

export class ArchiveProductGroupUsecase
	implements Usecase<ArchiveProductGroupInput>
{
	constructor(private uow: IUnitOfWork) {}
	async call(input: ArchiveProductGroupInput): Promise<void> {
		const groupRepo = this.uow.getProductGroupRepository()
		const group = await groupRepo.findById(input.id)
		if (!group) {
			throw new ProductGroupNotFoundException()
		}
		const groupManager = new ProductGroupManager()
		groupManager.archiveProductGroup(group)
		await this.uow.save(group)
	}
}
