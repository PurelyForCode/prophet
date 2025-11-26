import { InternalServerError } from "../../core/exceptions/InternalServerError.js"
import { IIdGenerator } from "../../core/interfaces/IIdGenerator.js"
import { IUnitOfWork } from "../../core/interfaces/IUnitOfWork.js"
import { Password } from "../../domain/account_management/entities/account/value_objects/Password.js"
import { Role } from "../../domain/account_management/entities/account/value_objects/Role.js"
import { Username } from "../../domain/account_management/entities/account/value_objects/Username.js"
import { AccountManager } from "../../domain/account_management/services/AccountManager.js"
import { IPasswordUtility } from "../../domain/account_management/utils/IPasswordUtility.js"

export async function createSuperAdmin(
	uow: IUnitOfWork,
	passwordUtility: IPasswordUtility,
	idGenerator: IIdGenerator,
) {
	const accountRepo = uow.getAccountRepository()
	const permissionRepo = uow.getPermissionRepository()
	if (await accountRepo.doesSuperAdminExist()) {
		return
	}
	const usernameString = process.env.SUPERADMIN_USERNAME
	const plainPassword = process.env.SUPERADMIN_PASSWORD
	if (!usernameString || !plainPassword) {
		console.log("SUPERADMIN environment credentials not defined in .env")
		throw new InternalServerError()
	}

	const username = new Username(usernameString)
	const password = new Password(await passwordUtility.hash(plainPassword))
	const accountManager = new AccountManager()

	const account = await accountManager.createAccount(
		accountRepo,
		permissionRepo,
		idGenerator.generate(),
		new Role("superadmin"),
		username,
		password,
	)

	await uow.save(account)
}
