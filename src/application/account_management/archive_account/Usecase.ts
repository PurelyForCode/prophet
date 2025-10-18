import { IIdGenerator } from "../../../core/interfaces/IIdGenerator.js"
import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { Password } from "../../../domain/account_management/entities/account/value_objects/Password.js"
import { Role } from "../../../domain/account_management/entities/account/value_objects/Role.js"
import { Username } from "../../../domain/account_management/entities/account/value_objects/Username.js"
import { AccountNotFoundException } from "../../../domain/account_management/exceptions/AccountNotFoundException.js"
import { UsernameIsTakenException } from "../../../domain/account_management/exceptions/UsernameIsTakenException.js"
import { AccountManager } from "../../../domain/account_management/services/AccountManager.js"
import { IPasswordUtility } from "../../../domain/account_management/utils/IPasswordUtility.js"

export type ArchiveAccountInput = {
	accountId: EntityId
}

export class CreateAccountUsecase {
	constructor(
		private readonly uow: IUnitOfWork,
	) {}
	async call(input: ArchiveAccountInput) {
		const accountRepo = this.uow.getAccountRepository()
		const account  = await accountRepo.findById(input.accountId)
		if(!account){
			throw new AccountNotFoundException()
		}
		const accountManager = new AccountManager()
		accountManager.
		await this.uow.save(account)
	}
}
