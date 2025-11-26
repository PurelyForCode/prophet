import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import ExcelJS from "exceljs"
import { SaleQueryDao } from "../../../infra/db/query_dao/SaleQueryDao.js"
import { ProductQueryDao } from "../../../infra/db/query_dao/ProductQueryDao.js"
import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"

type ExportSalesTemplateInput = {
	productId?: EntityId
	includeArchived?: boolean
}

export class ExportSalesTemplateUsecase
	implements Usecase<ExportSalesTemplateInput, ExcelJS.Buffer>
{
	constructor(
		private readonly knex: Knex,
		private readonly uow: IUnitOfWork,
	) {}

	async call(input: ExportSalesTemplateInput): Promise<ExcelJS.Buffer> {
		const saleQueryDao = new SaleQueryDao(this.knex)
		const productQueryDao = new ProductQueryDao(this.knex)

		// Fetch sales (not summed, so we get SaleQueryDto[])
		const sales = (await saleQueryDao.query(
			{ limit: 10000, offset: 0 },
			{
				productId: input.productId,
				archived: input.includeArchived ?? false,
			},
			["-date"],
		)) as Array<{
			id: string
			productId: string
			quantity: number
			status: string
			date: Date
			deletedAt: Date | null
		}>

		// Fetch products for the sales
		const productIds = [...new Set(sales.map((s) => s.productId))]
		const products = await Promise.all(
			productIds.map((id) =>
				productQueryDao.queryById(id, { settings: false }),
			),
		)
		const productMap = new Map(
			products.filter((p) => p !== null).map((p) => [p!.id, p!]),
		)

		// Create workbook and worksheet
		const workbook = new ExcelJS.Workbook()
		const worksheet = workbook.addWorksheet("Sales")

		// Define columns
		worksheet.columns = [
			{ header: "Sale ID", key: "saleId", width: 40 },
			{ header: "Product ID", key: "productId", width: 40 },
			{ header: "Product Name", key: "productName", width: 30 },
			{ header: "Quantity", key: "quantity", width: 12 },
			{ header: "Status", key: "status", width: 15 },
			{ header: "Date", key: "date", width: 15 },
			{ header: "Archived", key: "archived", width: 12 },
		]

		// Style header row
		worksheet.getRow(1).font = { bold: true }
		worksheet.getRow(1).fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFD3D3D3" },
		}

		// Add data rows
		for (const sale of sales) {
			const product = productMap.get(sale.productId)
			worksheet.addRow({
				saleId: sale.id,
				productId: sale.productId,
				productName: product?.name || "Unknown",
				quantity: sale.quantity,
				status: sale.status,
				date: sale.date,
				archived: sale.deletedAt ? "TRUE" : "FALSE",
			})
		}

		// Add data validation for status column
		worksheet.getColumn("status").eachCell((cell, rowNumber) => {
			if (rowNumber > 1) {
				cell.dataValidation = {
					type: "list",
					allowBlank: false,
					formulae: ['"completed,pending,cancelled"'],
				}
			}
		})

		worksheet.getColumn("archived").eachCell((cell, rowNumber) => {
			if (rowNumber > 1) {
				cell.dataValidation = {
					type: "list",
					allowBlank: false,
					formulae: ['"TRUE,FALSE"'],
				}
			}
		})

		// Format date column
		worksheet.getColumn("date").numFmt = "yyyy-mm-dd"

		// Add instructions sheet
		const instructionsSheet = workbook.addWorksheet("Instructions")
		instructionsSheet.columns = [{ header: "Instructions", width: 80 }]

		const instructions = [
			""
		]

		for (const instruction of instructions) {
			instructionsSheet.addRow({ Instructions: instruction })
		}

		instructionsSheet.getColumn(1).alignment = {
			wrapText: true,
			vertical: "top",
		}

		return await workbook.xlsx.writeBuffer()
	}
}

