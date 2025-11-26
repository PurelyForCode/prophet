import {
	AggregateRoot,
	EntityAction,
} from "../../../../core/interfaces/AggregateRoot.js"
import { EntityCollection } from "../../../../core/types/EntityCollection.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { PermissionAlreadyGrantedException } from "../../exceptions/PermissionAlreadyGrantedException.js"
import { PermissionNotGrantedToAccountException } from "../../exceptions/PermissionNotGrantedToAccountException.js"
import { Permission } from "../permission/Permission.js"
import { AccountPermission } from "./value_objects/AccountPermission.js"
import { Password } from "./value_objects/Password.js"
import { Role } from "./value_objects/Role.js"
import { Username } from "./value_objects/Username.js"

export type AccountUpdateableFields = {
	username: string
	role: string
}

export class Account extends AggregateRoot {
	private constructor(
		id: EntityId,
		private _username: Username,
		private _role: Role,
		private _password: Password,
		private _createdAt: Date,
		private _updatedAt: Date,
		private _deletedAt: Date | null,
		private _permissions: EntityCollection<AccountPermission>,
	) {
		super(id)
	}

	static create(props: {
		id: EntityId
		username: Username
		role: Role
		password: Password
		createdAt: Date
		updatedAt: Date
		deletedAt: Date | null
		permissions: EntityCollection<AccountPermission>
	}) {
		return new Account(
			props.id,
			props.username,
			props.role,
			props.password,
			props.createdAt,
			props.updatedAt,
			props.deletedAt,
			props.permissions,
		)
	}

	archive() {
		this.deletedAt = new Date()
		this.addTrackedEntity(this, EntityAction.updated)
	}

	changePassword(password: Password) {
		this.password = password
		this.addTrackedEntity(this, EntityAction.updated)
	}

	grantPermission(permission: Permission) {
		if (this.permissions.has(permission.id)) {
			throw new PermissionAlreadyGrantedException()
		}

		const accountPermission = AccountPermission.create(
			this.id,
			permission.id,
		)

		this.permissions.set(
			accountPermission.id.permissionId,
			accountPermission,
		)
		this.addTrackedEntity(accountPermission, EntityAction.created)
	}

	revokePermission(permissionId: EntityId) {
		const revoked = this.permissions.get(permissionId)
		if (!revoked) {
			throw new PermissionNotGrantedToAccountException()
		}
		this.permissions.delete(permissionId)
		this.addTrackedEntity(revoked, EntityAction.deleted)
	}

	public get deletedAt(): Date | null {
		return this._deletedAt
	}
	public set deletedAt(value: Date | null) {
		this._deletedAt = value
	}
	public get updatedAt(): Date {
		return this._updatedAt
	}
	public set updatedAt(value: Date) {
		this._updatedAt = value
	}
	public get createdAt(): Date {
		return this._createdAt
	}
	public set createdAt(value: Date) {
		this._createdAt = value
	}
	public get password(): Password {
		return this._password
	}
	public set password(value: Password) {
		this._password = value
	}
	public get role(): Role {
		return this._role
	}
	public set role(value: Role) {
		this._role = value
	}
	public get username(): Username {
		return this._username
	}
	public set username(value: Username) {
		this._username = value
	}

	public get permissions(): EntityCollection<AccountPermission> {
		return this._permissions
	}
	public set permissions(value: EntityCollection<AccountPermission>) {
		this._permissions = value
	}
}
