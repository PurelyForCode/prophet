import { IIdGenerator } from "../../../core/interfaces/IIdGenerator.js"
import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Password } from "../../../domain/account_management/entities/account/value_objects/Password.js"
import { Role } from "../../../domain/account_management/entities/account/value_objects/Role.js"
import { Username } from "../../../domain/account_management/entities/account/value_objects/Username.js"
import { AccountManager } from "../../../domain/account_management/services/AccountManager.js"
import { IPasswordUtility } from "../../../domain/account_management/utils/IPasswordUtility.js"

export type CreateAccountInput = {
	username: string
	password: string
	role: string
}

export class CreateAccountUsecase {
	constructor(
		private readonly uow: IUnitOfWork,
		private readonly idGenerator: IIdGenerator,
		private readonly passwordUtility: IPasswordUtility,
	) {}
	async call(input: CreateAccountInput) {
		const accountRepo = this.uow.getAccountRepository()
		const permissionRepo = this.uow.getPermissionRepository()

		const username = new Username(input.username)
		const role = new Role(input.role)
		const hashed = await this.passwordUtility.hash(input.password)
		const password = new Password(hashed)

		const accountManager = new AccountManager()

		const account = await accountManager.createAccount(
			accountRepo,
			permissionRepo,
			this.idGenerator.generate(),
			role,
			username,
			password,
		)
		await this.uow.save(account)
	}
}
