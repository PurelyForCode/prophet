import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { IPermissionRepository } from "../../../domain/account_management/repositories/IPermissionRepository.js"
import { PermissionDao, PermissionDto } from "../dao/PermissionDao.js"
import { Permission } from "../../../domain/account_management/entities/permission/Permission.js"
import { StandardName } from "../../../core/value_objects/StandardName.js"
import { EntityCollection } from "../../../core/types/EntityCollection.js"

export class PermissionRepository implements IPermissionRepository {
	private permissionDao: PermissionDao
	constructor(knex: Knex) {
		this.permissionDao = new PermissionDao(knex)
	}

	async findDefaultStaffPermissions(): Promise<EntityCollection<Permission>> {
		return new Map()
	}

	async findAll(): Promise<EntityCollection<Permission>> {
		return await this.permissionDao.findAll()
	}

	async findById(id: EntityId): Promise<Permission | null> {
		const result = await this.permissionDao.findById(id)
		if (result) {
			return this.mapToEntity(result)
		} else {
			return null
		}
	}

	mapToEntity(account: PermissionDto): Permission {
		return Permission.create(
			account.id,
			new StandardName(account.name, "Permission name"),
			account.createdAt,
			account.updatedAt,
		)
	}
}
