import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import ExcelJS from "exceljs"
import { CreateSaleUsecase } from "../../sales_management/create_sale/Usecase.js"
import { UpdateSaleUsecase } from "../../sales_management/update_sale/Usecase.js"
import { ArchiveSaleUsecase } from "../../sales_management/archive_sale/Usecase.js"
import { IIdGenerator } from "../../../core/interfaces/IIdGenerator.js"
import { SaleQueryDao } from "../../../infra/db/query_dao/SaleQueryDao.js"
import { ProductQueryDao } from "../../../infra/db/query_dao/ProductQueryDao.js"
import { Knex } from "knex"
import { IsolationLevel } from "../../../core/interfaces/IUnitOfWork.js"
import { runInTransaction } from "../../../infra/utils/UnitOfWork.js"
import { IEventBus } from "../../../core/interfaces/IDomainEventBus.js"

type ImportSalesInput = {
	fileBuffer: Buffer
	accountId: string
}

type ImportResult = {
	salesCreated: number
	salesUpdated: number
	salesArchived: number
	errors: Array<{ row: number; message: string }>
}

export class ImportSalesUsecase
	implements Usecase<ImportSalesInput, ImportResult>
{
	constructor(
		private readonly knex: Knex,
		private readonly uow: IUnitOfWork,
		private readonly idGenerator: IIdGenerator,
		private readonly eventBus: IEventBus,
	) {}

	async call(input: ImportSalesInput): Promise<ImportResult> {
		const workbook = new ExcelJS.Workbook()
		await workbook.xlsx.load(input.fileBuffer as any)

		const worksheet = workbook.getWorksheet("Sales")
		if (!worksheet) {
			throw new Error("Sales worksheet not found in Excel file")
		}

		const result: ImportResult = {
			salesCreated: 0,
			salesUpdated: 0,
			salesArchived: 0,
			errors: [],
		}

		const saleQueryDao = new SaleQueryDao(this.knex)
		const productQueryDao = new ProductQueryDao(this.knex)

		// Skip header row, start from row 2
		for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
			const row = worksheet.getRow(rowNumber)

			try {
				const saleId = row.getCell("saleId").value?.toString().trim() || ""
				const productId =
					row.getCell("productId").value?.toString().trim() || ""
				const quantity = Number(row.getCell("quantity").value) || 0
				const status = row.getCell("status").value?.toString().trim() || ""
				const dateValue = row.getCell("date").value
				const archived =
					row.getCell("archived").value?.toString().trim() === "TRUE"

				// Parse date
				let date: Date
				if (dateValue instanceof Date) {
					date = dateValue
				} else if (typeof dateValue === "string") {
					date = new Date(dateValue)
				} else {
					result.errors.push({
						row: rowNumber,
						message: "Invalid date format",
					})
					continue
				}

				// Skip empty rows
				if (!productId) {
					continue
				}

				// Validate required fields
				if (quantity <= 0) {
					result.errors.push({
						row: rowNumber,
						message: "Quantity must be greater than 0",
					})
					continue
				}

				if (!["completed", "pending", "cancelled"].includes(status)) {
					result.errors.push({
						row: rowNumber,
						message:
							"Status must be one of: completed, pending, cancelled",
					})
					continue
				}

				// Verify product exists
				const product = await productQueryDao.queryById(productId, {
					settings: false,
				})
				if (!product) {
					result.errors.push({
						row: rowNumber,
						message: `Product ID ${productId} not found`,
					})
					continue
				}

				if (!saleId) {
					// New sale - create it
					try {
						const createSaleUsecase = new CreateSaleUsecase(
							this.uow,
							this.idGenerator,
							this.eventBus,
						)
						
						await runInTransaction(
							this.uow,
							IsolationLevel.READ_COMMITTED,
							async () => {
								await createSaleUsecase.call({
									accountId: input.accountId,
									productId,
									groupId: product.groupId,
									quantity,
									status: status as "completed" | "pending" | "cancelled",
									date,
								})
								result.salesCreated++
							},
						)
					} catch (error: any) {
						result.errors.push({
							row: rowNumber,
							message: `Failed to create sale: ${error.message}`,
						})
						continue
					}
				} else {
					// Existing sale - check if needs update
					const existingSale = await saleQueryDao.queryById(saleId, {
						productId,
					})

					if (!existingSale) {
						result.errors.push({
							row: rowNumber,
							message: `Sale ID ${saleId} not found`,
						})
						continue
					}

					const needsUpdate =
						existingSale.quantity !== quantity ||
						existingSale.status !== status ||
						existingSale.date.getTime() !== date.getTime()

					if (needsUpdate || (archived && !existingSale.deletedAt)) {
						try {
							await runInTransaction(
								this.uow,
								IsolationLevel.READ_COMMITTED,
								async () => {
									if (archived && !existingSale.deletedAt) {
										const archiveUsecase = new ArchiveSaleUsecase(
											this.uow,
											this.eventBus,
										)
										await archiveUsecase.call({
											saleId,
											productId,
											groupId: product.groupId,
										})
										result.salesArchived++
									} else if (needsUpdate) {
										const updateUsecase = new UpdateSaleUsecase(
											this.uow,
											this.eventBus,
										)
										await updateUsecase.call({
											saleId,
											productId,
											groupId: product.groupId,
											fields: {
												quantity,
												status: status as
													| "completed"
													| "pending"
													| "cancelled",
												date,
											},
										})
										result.salesUpdated++
									}
								},
							)
						} catch (error: any) {
							result.errors.push({
								row: rowNumber,
								message: `Failed to update sale: ${error.message}`,
							})
							continue
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

