import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import ExcelJS from "exceljs"
import { CreateProductGroupUsecase } from "../../product_management/product_group/create_product_group/usecase.js"
import { UpdateProductGroupUsecase } from "../../product_management/product_group/update_product_group/usecase.js"
import { ArchiveProductGroupUsecase } from "../../product_management/product_group/archive_product_group/usecase.js"
import { CreateProductUsecase } from "../../product_management/product/create_product/Usecase.js"
import { UpdateProductUsecase } from "../../product_management/product/update_product/Usecase.js"
import { ArchiveProductUsecase } from "../../product_management/product/archive_product/Usecase.js"
import { IIdGenerator } from "../../../core/interfaces/IIdGenerator.js"
import { ProductGroupQueryDao } from "../../../infra/db/query_dao/ProductGroupQueryDao.js"
import { ProductQueryDao } from "../../../infra/db/query_dao/ProductQueryDao.js"
import { Knex } from "knex"
import { IsolationLevel } from "../../../core/interfaces/IUnitOfWork.js"
import { runInTransaction } from "../../../infra/utils/UnitOfWork.js"
import { IEventBus } from "../../../core/interfaces/IDomainEventBus.js"

type ImportProductsInput = {
	fileBuffer: Buffer
	accountId: string
}

type ImportResult = {
	groupsCreated: number
	groupsUpdated: number
	groupsArchived: number
	productsCreated: number
	productsUpdated: number
	productsArchived: number
	errors: Array<{ row: number; message: string }>
}

export class ImportProductsUsecase
	implements Usecase<ImportProductsInput, ImportResult>
{
	constructor(
		private readonly knex: Knex,
		private readonly uow: IUnitOfWork,
		private readonly idGenerator: IIdGenerator,
		private readonly eventBus: IEventBus,
	) {}

	async call(input: ImportProductsInput): Promise<ImportResult> {
		const workbook = new ExcelJS.Workbook()
		await workbook.xlsx.load(input.fileBuffer as any)

		const worksheet = workbook.getWorksheet("Products")
		if (!worksheet) {
			throw new Error("Products worksheet not found in Excel file")
		}

		const result: ImportResult = {
			groupsCreated: 0,
			groupsUpdated: 0,
			groupsArchived: 0,
			productsCreated: 0,
			productsUpdated: 0,
			productsArchived: 0,
			errors: [],
		}

		const productGroupQueryDao = new ProductGroupQueryDao(this.knex)
		const productQueryDao = new ProductQueryDao(this.knex)

		// Track groups we've already processed in this import
		const processedGroups = new Map<string, string>() // groupId -> new/existing groupId

		// Skip header row, start from row 2
		for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
			const row = worksheet.getRow(rowNumber)

			try {
				const groupId = row.getCell("groupId").value?.toString().trim() || ""
				const groupName =
					row.getCell("groupName").value?.toString().trim() || ""
				const productId =
					row.getCell("productId").value?.toString().trim() || ""
				const productName =
					row.getCell("productName").value?.toString().trim() || ""
				const stock = Number(row.getCell("stock").value) || 0
				const safetyStock = Number(row.getCell("safetyStock").value) || 0
				const safetyStockMethod =
					row.getCell("safetyStockMethod").value?.toString().trim() || ""
				const serviceLevel = Number(row.getCell("serviceLevel").value) || 95
				const fillRate = Number(row.getCell("fillRate").value) || 98
				const classification =
					row.getCell("classification").value?.toString().trim() || "fast"
				const archived =
					row.getCell("archived").value?.toString().trim() === "TRUE"

				// Skip empty rows
				if (!groupName && !productName) {
					continue
				}

				// Validate required fields
				if (!groupName) {
					result.errors.push({
						row: rowNumber,
						message: "Group Name is required",
					})
					continue
				}

				let currentGroupId = groupId

				// Handle Group Creation/Update
				if (!groupId) {
					// New group - create it
					if (!processedGroups.has(groupName)) {
						try {
							const createGroupUsecase =
								new CreateProductGroupUsecase(
									this.uow,
									this.idGenerator,
								)
							
							await runInTransaction(
								this.uow,
								IsolationLevel.READ_COMMITTED,
								async () => {
									await createGroupUsecase.call({
										accountId: input.accountId,
										categoryId: null,
										name: groupName,
										setting: null,
									})
								},
							)
							
							// Get the created group ID by querying
							const createdGroups = await productGroupQueryDao.query(
								{ limit: 1, offset: 0 },
								{ name: groupName },
								undefined,
								undefined,
							)
							if (createdGroups.length > 0) {
								currentGroupId = createdGroups[0].id
								processedGroups.set(groupName, currentGroupId)
								result.groupsCreated++
							}
						} catch (error: any) {
							result.errors.push({
								row: rowNumber,
								message: `Failed to create group: ${error.message}`,
							})
							continue
						}
					} else {
						currentGroupId = processedGroups.get(groupName)!
					}
				} else {
					// Existing group - check if needs update
					const existingGroup = await productGroupQueryDao.queryById(
						groupId,
						undefined,
					)

					if (!existingGroup) {
						result.errors.push({
							row: rowNumber,
							message: `Group ID ${groupId} not found`,
						})
						continue
					}

					// Update group if name changed or archived status changed
					if (
						existingGroup.name !== groupName ||
						(archived && !existingGroup.deletedAt) ||
						(!archived && existingGroup.deletedAt)
					) {
						try {
							await runInTransaction(
								this.uow,
								IsolationLevel.READ_COMMITTED,
								async () => {
									if (archived && !existingGroup.deletedAt) {
										const archiveUsecase =
											new ArchiveProductGroupUsecase(this.uow)
										await archiveUsecase.call({ id: groupId })
										result.groupsArchived++
									} else {
										const updateUsecase = new UpdateProductGroupUsecase(
											this.uow,
										)
										await updateUsecase.call({
											id: groupId,
											fields: { name: groupName },
										})
										result.groupsUpdated++
									}
								},
							)
						} catch (error: any) {
							result.errors.push({
								row: rowNumber,
								message: `Failed to update group: ${error.message}`,
							})
							continue
						}
					}
				}

				// Handle Product if product name is provided
				if (productName && currentGroupId) {
					if (!productId) {
						// New product - create it
						try {
							const createProductUsecase = new CreateProductUsecase(
								this.uow,
								this.eventBus,
								this.idGenerator,
							)
							
							await runInTransaction(
								this.uow,
								IsolationLevel.READ_COMMITTED,
								async () => {
									await createProductUsecase.call({
										accountId: input.accountId,
										groupId: currentGroupId!,
										name: productName,
										settings: {
											classification: classification as "fast" | "slow",
											fillRate,
											safetyStockCalculationMethod: safetyStockMethod as
												| "manual"
												| "dynamic"
												| "historical",
											serviceLevel,
										},
									})
									result.productsCreated++
								},
							)
						} catch (error: any) {
							result.errors.push({
								row: rowNumber,
								message: `Failed to create product: ${error.message}`,
							})
							continue
						}
					} else {
						// Existing product - check if needs update
						const existingProduct = await productQueryDao.queryById(
							productId,
							{ settings: true },
						)

						if (!existingProduct) {
							result.errors.push({
								row: rowNumber,
								message: `Product ID ${productId} not found`,
							})
							continue
						}

						const needsUpdate =
							existingProduct.name !== productName ||
							existingProduct.safetyStock !== safetyStock ||
							existingProduct.setting?.classification !== classification ||
							existingProduct.setting?.fillRate !== fillRate ||
							existingProduct.setting?.safetyStockCalculationMethod !==
								safetyStockMethod ||
							existingProduct.setting?.serviceLevel !== serviceLevel

						if (needsUpdate || (archived && !existingProduct.deletedAt)) {
							try {
								await runInTransaction(
									this.uow,
									IsolationLevel.READ_COMMITTED,
									async () => {
										if (archived && !existingProduct.deletedAt) {
											const archiveUsecase = new ArchiveProductUsecase(
												this.uow,
											)
											await archiveUsecase.call({
												productId,
												groupId: currentGroupId!,
											})
											result.productsArchived++
										} else if (needsUpdate) {
											const updateUsecase = new UpdateProductUsecase(
												this.uow,
											)
											await updateUsecase.call({
												productId,
												groupId: currentGroupId!,
												fields: {
													name: productName,
													safetyStock,
													settings: {
														classification: classification as
															| "fast"
															| "slow",
														fillRate,
														safetyStockCalculationMethod:
															safetyStockMethod as
																| "manual"
																| "dynamic"
																| "historical",
														serviceLevel,
													},
												},
											})
											result.productsUpdated++
										}
									},
								)
							} catch (error: any) {
								result.errors.push({
									row: rowNumber,
									message: `Failed to update product: ${error.message}`,
								})
								continue
							}
						}
					}
				}
			} catch (error: any) {
				result.errors.push({
					row: rowNumber,
					message: `Unexpected error: ${error.message}`,
				})
			}
		}

		return result
	}
}

