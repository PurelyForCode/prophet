import { knexInstance } from "../../config/Knex.js"
import { idGenerator } from "../../infra/utils/IdGenerator.js"

type PermissionTable = {
	id: string
	name: string
	created_at: Date
	updated_at: Date
}

export type PermissionValues =
	| "MANAGE_RECOMMENDATIONS"
	| "MANAGE_PRODUCTS"
	| "MANAGE_FORECASTS"
	| "MANAGE_SALES"
	| "MANAGE_ACCOUNTS"
	| "ADMIN_ACCESS"

const permissionNames = [
	"MANAGE_RECOMMENDATIONS",
	"MANAGE_PRODUCTS",
	"MANAGE_FORECASTS",
	"MANAGE_SALES",
	"MANAGE_ACCOUNTS",
	"ADMIN_ACCESS",
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
