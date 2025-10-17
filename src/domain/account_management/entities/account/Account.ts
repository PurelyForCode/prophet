import { AggregateRoot } from "../../../../core/interfaces/AggregateRoot.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { Password } from "./value_objects/Password.js"
import { Role } from "./value_objects/Role.js"
import { Username } from "./value_objects/Username.js"

export class Account extends AggregateRoot {
	private constructor(
		id: EntityId,
		private _username: Username,
		private _role: Role,
		private _password: Password,
		private _createdAt: Date,
		private _updatedAt: Date,
		private _deletedAt: Date | null,
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
	}) {
		return new Account(
			props.id,
			props.username,
			props.role,
			props.password,
			props.createdAt,
			props.updatedAt,
			props.deletedAt,
		)
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
}
