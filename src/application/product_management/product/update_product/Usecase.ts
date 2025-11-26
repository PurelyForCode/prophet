import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../../core/interfaces/Usecase.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { ProductName } from "../../../../domain/product_management/entities/product/value_objects/ProductName.js"
import { ProductSetting } from "../../../../domain/product_management/entities/product/value_objects/ProductSetting.js"
import { ProductStock } from "../../../../domain/product_management/entities/product/value_objects/ProductStock.js"
import { SafetyStock } from "../../../../domain/product_management/entities/product/value_objects/SafetyStock.js"
import { ProductGroupNotFoundException } from "../../../../domain/product_management/exceptions/ProductGroupNotFoundException.js"
import { ProductNotFoundException } from "../../../../domain/product_management/exceptions/ProductNotFoundException.js"

export type UpdateProductInput = {
	groupId: EntityId
	fields: Partial<{
		name: string
		safetyStock: number
		stock: number
		settings: Partial<{
			safetyStockCalculationMethod: string
			classification: string
			serviceLevel: number
			fillRate: number
		}>
	}>
	productId: EntityId
}

export class UpdateProductUsecase implements Usecase<any, any> {
	constructor(private readonly uow: IUnitOfWork) {}
	async call(input: UpdateProductInput) {
		const groupRepo = this.uow.getProductGroupRepository()
		const group = await groupRepo.findById(input.groupId)
		if (!group) {
			throw new ProductGroupNotFoundException()
		}

		const now = new Date()
		let updatedSettings = undefined
		if (input.fields.settings) {
			const product = group.getVariant(input.productId)
			if (!product) {
				throw new ProductNotFoundException()
			}
			const existingSettings = product.settings
			updatedSettings = new ProductSetting(
				input.fields.settings.serviceLevel ??
					existingSettings.serviceLevel,
				input.fields.settings.safetyStockCalculationMethod ??
					existingSettings.safetyStockCalculationMethod,
				input.fields.settings.classification ??
					existingSettings.classification,
				input.fields.settings.fillRate ?? existingSettings.fillRate,
				now,
			)
		}
		group.updateVariant(input.productId, {
			name: input.fields.name
				? new ProductName(input.fields.name)
				: undefined,
			safetyStock: input.fields.safetyStock
				? new SafetyStock(input.fields.safetyStock)
				: undefined,
			settings: updatedSettings,
			stock: input.fields.stock
				? new ProductStock(input.fields.stock)
				: undefined,
			updatedAt: now,
		})
		await this.uow.save(group)
	}
}
