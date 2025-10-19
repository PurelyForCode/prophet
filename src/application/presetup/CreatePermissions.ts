import { knexInstance } from "../../config/Knex.js"
import { idGenerator } from "../../infra/utils/IdGenerator.js"

type PermissionTable = {
	id: string
	name: string
	created_at: Date
	updated_at: Date
}

const permissionNames = [
	"MANAGE_INVENTORY",
	"MANAGE_DELIVERIES",
	"MANAGE_PRODUCTS",
	"MANAGE_FORECASTS",
	"MANAGE_SALES",
	"ACCESS_DEBUG",
]

export async function createPermissions() {
	const tx = await knexInstance.transaction()
	const result = await tx("permission").first()
	if (result) {
		return
	}
	const now = new Date()

	for (const name of permissionNames) {
		await tx<PermissionTable>("permission").insert({
			id: idGenerator.generate(),
			name: name,
			created_at: now,
			updated_at: now,
		})
	}
	await tx.commit()
}
