import { Usecase } from "../../../core/interfaces/Usecase.js"
import ExcelJS from "exceljs"
import { ProductQueryDao } from "../../../infra/db/query_dao/ProductQueryDao.js"
import { ProductGroupQueryDao } from "../../../infra/db/query_dao/ProductGroupQueryDao.js"
import { Knex } from "knex"

type ExportProductsTemplateInput = {
	includeArchived?: boolean
}

export class ExportProductsTemplateUsecase
	implements Usecase<ExportProductsTemplateInput, ExcelJS.Buffer> {
	constructor(
		private readonly knex: Knex,
	) { }

	async call(input: ExportProductsTemplateInput): Promise<ExcelJS.Buffer> {
		const productQueryDao = new ProductQueryDao(this.knex)
		const productGroupQueryDao = new ProductGroupQueryDao(this.knex)

		// Fetch all product groups
		const groups = await productGroupQueryDao.queryExcel(
			{ archived: input.includeArchived ?? false },
			undefined,
			undefined,
		)

		// Fetch all products with settings
		const products = await productQueryDao.queryExcel(
			{ archived: input.includeArchived ?? false },
			{ settings: true },
			undefined,
		)

		// Create workbook and worksheet
		const workbook = new ExcelJS.Workbook()
		const worksheet = workbook.addWorksheet("Products")

		// Define columns
		worksheet.columns = [
			{ header: "Group ID", key: "groupId", width: 40 },
			{ header: "Group Name", key: "groupName", width: 30 },
			{ header: "Group Archived", key: "groupArchived", width: 30 },
			{ header: "Product ID", key: "productId", width: 40 },
			{ header: "Product Name", key: "productName", width: 30 },
			{ header: "Stock", key: "stock", width: 12 },
			{ header: "Safety Stock", key: "safetyStock", width: 15 },
			{
				header: "Safety Stock Method",
				key: "safetyStockMethod",
				width: 20,
			},
			{ header: "Service Level", key: "serviceLevel", width: 15 },
			{ header: "Fill Rate", key: "fillRate", width: 12 },
			{ header: "Classification", key: "classification", width: 15 },
			{ header: "Product Archived", key: "productArchived", width: 12 },
		]
		const groupArchivedCol = worksheet.getColumn("groupArchived")
		groupArchivedCol.numFmt = '"TRUE";;"FALSE"'

		const productArchivedCol = worksheet.getColumn("productArchived")
		productArchivedCol.numFmt = '"TRUE";;"FALSE"'

		// Style header row
		worksheet.getRow(1).font = { bold: true }
		worksheet.getRow(1).fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFD3D3D3" },
		}

		// Group products by group
		const groupMap = new Map<string, (typeof products)[0][]>()
		for (const product of products) {
			if (!groupMap.has(product.groupId)) {
				groupMap.set(product.groupId, [])
			}
			groupMap.get(product.groupId)!.push(product)
		}

		// Add data rows
		for (const group of groups) {
			const groupProducts = groupMap.get(group.id) || []

			if (groupProducts.length === 0) {
				// Add group row even if no products
				worksheet.addRow({
					groupId: group.id,
					groupName: group.name,
					groupArchived: group.deletedAt ? 1 : 0,
					productId: "",
					productName: "",
					stock: "",
					safetyStock: "",
					safetyStockMethod: "",
					serviceLevel: "",
					fillRate: "",
					classification: "",
					productArchived: "",
				})
			} else {
				for (const product of groupProducts) {
					worksheet.addRow({
						groupId: group.id,
						groupName: group.name,
						groupArchived: group.deletedAt ? 1 : 0,
						productId: product.id,
						productName: product.name,
						stock: product.stock,
						safetyStock: product.safetyStock,
						safetyStockMethod:
							product.setting?.safetyStockCalculationMethod || "",
						serviceLevel: product.setting?.serviceLevel || "",
						fillRate: product.setting?.fillRate || "",
						classification: product.setting?.classification || "",
						productArchived: product.deletedAt ? 1 : 0,
					})
				}
			}
		}

		// Add data validation for dropdowns
		const lastRow = worksheet.rowCount
		worksheet.getColumn("safetyStockMethod").eachCell((cell, rowNumber) => {
			if (rowNumber > 1) {
				cell.dataValidation = {
					type: "list",
					allowBlank: true,
					formulae: ['"manual,dynamic,historical"'],
				}
			}
		})

		worksheet.getColumn("classification").eachCell((cell, rowNumber) => {
			if (rowNumber > 1) {
				cell.dataValidation = {
					type: "list",
					allowBlank: true,
					formulae: ['"fast,slow"'],
				}
			}
		})

		worksheet.getColumn('groupArchived').eachCell((cell, _rowNumber) => {
			cell.dataValidation = {
				type: 'list',
				allowBlank: false,
				formulae: ['"0,1"'],
				showErrorMessage: true,
				errorStyle: 'error',
				errorTitle: 'Invalid value',
				error: 'Value must be 0 or 1',
			};
		})
		worksheet.getColumn('productArchived').eachCell((cell, _rowNumber) => {
			cell.dataValidation = {
				type: 'list',
				allowBlank: false,
				formulae: ['"0,1"'],
				showErrorMessage: true,
				errorStyle: 'error',
				errorTitle: 'Invalid value',
				error: 'Value must be 0 or 1',
			};
		})

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

