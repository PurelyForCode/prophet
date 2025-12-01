import { Usecase } from "../../../core/interfaces/Usecase.js"
import ExcelJS from "exceljs"
import { SaleQueryDao } from "../../../infra/db/query_dao/SaleQueryDao.js"
import { ProductQueryDao, ProductQueryDto } from "../../../infra/db/query_dao/ProductQueryDao.js"
import { Knex } from "knex"
import { ProductGroupQueryDao, ProductGroupQueryDto } from "../../../infra/db/query_dao/ProductGroupQueryDao.js"

type ExportSalesTemplateInput = {
	includeArchived?: boolean
	dateRangeStart?: Date,
	dateRangeEnd?: Date,
}

export class ExportSalesTemplateUsecase
	implements Usecase<ExportSalesTemplateInput, ExcelJS.Buffer | null> {
	constructor(
		private readonly knex: Knex,
	) { }

	async call(input: ExportSalesTemplateInput): Promise<ExcelJS.Buffer | null> {
		const saleQueryDao = new SaleQueryDao(this.knex)
		const groupQueryDao = new ProductGroupQueryDao(this.knex)
		const productQueryDao = new ProductQueryDao(this.knex)

		const now = new Date
		const defaultStart = new Date(now)
		defaultStart.setFullYear(defaultStart.getFullYear() - 1)

		const dateRangeStart = input.dateRangeStart ?? defaultStart
		let dateRangeEnd
		if (input.dateRangeEnd) {
			dateRangeEnd = input.dateRangeEnd
		} else {
			const latestSale = await saleQueryDao.getLatest()
			dateRangeEnd = latestSale ? latestSale.date : now
		}

		const sales = await saleQueryDao.queryExcel(
			{
				archived: input.includeArchived ?? false,
				dateRangeEnd: dateRangeEnd,
				dateRangeStart: dateRangeStart
			},
			["-date"],
		)
		if (sales.length === 0) {
			return null
		}

		// Fetch products for the sales
		const productMap = new Map<string, ProductQueryDto>()
		const productIds = new Set(sales.map((s) => s.productId))

		for (const id of productIds) {
			const product = await productQueryDao.queryById(id, { settings: false })
			if (product) {
				productMap.set(product.id, product)
			}
		}

		const groupMap = new Map<string, ProductGroupQueryDto>()
		const groupIds = new Set(productMap.values().map(val => val.groupId))
		for (const id of groupIds) {
			const group = await groupQueryDao.queryById(id, { productSales: false, productSettings: false })
			if (group) {
				groupMap.set(group.id, group)
			}
		}

		// Create workbook and worksheet
		const workbook = new ExcelJS.Workbook()
		const worksheet = workbook.addWorksheet("Sales")

		// Define columns
		worksheet.columns = [
			{ header: "Sale ID", key: "saleId", width: 40 },
			{ header: "Product ID", key: "groupId", width: 40 },
			{ header: "Variant ID", key: "productId", width: 40 },
			{ header: "Product Name", key: "productGroupName", width: 30 },
			{ header: "Variant", key: "productName", width: 30 },
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
			if (!product) {
				throw new Error()
			}
			const group = groupMap.get(product.groupId)
			if (!group) {
				throw new Error()
			}

			worksheet.addRow({
				saleId: sale.id,
				groupId: group.id,
				productId: sale.productId,
				productGroupName: group.name,
				productName: product?.name || "Unknown",
				quantity: sale.quantity,
				status: sale.status,
				date: sale.date,
				archived: sale.deletedAt ? 1 : 0
			})
		}
		const archiveColumn = worksheet.getColumn("archived")
		archiveColumn.numFmt = '"TRUE";;"FALSE"'

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

