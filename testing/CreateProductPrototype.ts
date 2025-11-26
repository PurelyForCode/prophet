import { knexInstance } from "../src/config/Knex.js"
import { IsolationLevel } from "../src/core/interfaces/IUnitOfWork.js"
import { EntityId } from "../src/core/types/EntityId.js"
import { ProductName } from "../src/domain/product_management/entities/product/value_objects/ProductName.js"
import { ProductSetting } from "../src/domain/product_management/entities/product/value_objects/ProductSetting.js"
import { ProductGroupManager } from "../src/domain/product_management/services/ProductGroupManager.js"
import { fakeId } from "../src/fakeId.js"
import { repositoryFactory } from "../src/infra/utils/RepositoryFactory.js"
import { runInTransaction, UnitOfWork } from "../src/infra/utils/UnitOfWork.js"

export async function createPrototypeProducts(
	groupId: EntityId,
	productId: EntityId,
	name: string,
	setting: ProductSetting,
) {
	const uow = new UnitOfWork(knexInstance, repositoryFactory)
	return await runInTransaction(
		uow,
		IsolationLevel.READ_COMMITTED,
		async () => {
			const groupMgr = new ProductGroupManager()
			const groupRepo = uow.getProductGroupRepository()
			const now = new Date()
			const group = await groupMgr.createProductGroup(groupRepo, {
				accountId: fakeId,
				now: now,
				productCategoryId: null,
				productGroupId: groupId,
				productGroupName: new ProductName(name),
				productId: productId,
				settings: setting,
			})
			await uow.save(group)
		},
	)
}
