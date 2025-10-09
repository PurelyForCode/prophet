import { knexInstance } from "../src/config/Knex.js"
import { ProductName } from "../src/domain/product_management/entities/product/value_objects/ProductName.js"
import { ProductSetting } from "../src/domain/product_management/entities/product/value_objects/ProductSetting.js"
import { ProductGroupManager } from "../src/domain/product_management/services/ProductGroupManager.js"
import { fakeId } from "../src/fakeId.js"
import { idGenerator } from "../src/infra/utils/IdGenerator.js"
import { repositoryFactory } from "../src/infra/utils/RepositoryFactory.js"
import { UnitOfWork } from "../src/infra/utils/UnitOfWork.js"

export async function createPrototypeProducts(
	name: string,
	setting: ProductSetting,
) {
	const uow = new UnitOfWork(knexInstance, repositoryFactory)
	const groupMgr = new ProductGroupManager()
	const groupRepo = uow.getProductGroupRepository()
	const now = new Date()
	const groupId = idGenerator.generate()
	const productId = idGenerator.generate()
	const group = await groupMgr.createProductGroup(groupRepo, {
		accountId: fakeId,
		now: now,
		productCategoryId: null,
		productGroupId: groupId,
		productGroupName: new ProductName(name),
		productId: productId,
		settings: setting,
	})
	await groupRepo.create(group)
	return { productId, groupId }
}
