import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../../core/interfaces/Usecase.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { ProductGroupNotFoundException } from "../../../../domain/product_management/exceptions/ProductGroupNotFoundException.js"

export type ArchiveProductInput = { productId: EntityId; groupId: EntityId }

export class ArchiveProductUsecase implements Usecase<any, any> {
	constructor(private readonly uow: IUnitOfWork) {}
	async call(input: ArchiveProductInput) {
		const groupRepo = this.uow.getProductGroupRepository()
		const group = await groupRepo.findById(input.groupId)
		if (!group) {
			throw new ProductGroupNotFoundException()
		}
		group.archiveVariant(input.productId)
		await this.uow.save(group)
	}
}
