import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { AccountNotFoundException } from "../../../domain/account_management/exceptions/AccountNotFoundException.js"
import { AccountManager } from "../../../domain/account_management/services/AccountManager.js"

export type ArchiveAccountInput = {
	accountId: EntityId
}

export class ArchiveAccountUsecase {
	constructor(private readonly uow: IUnitOfWork) {}
	async call(input: ArchiveAccountInput) {
		const accountRepo = this.uow.getAccountRepository()
		const account = await accountRepo.findById(input.accountId)
		if (!account) {
			throw new AccountNotFoundException()
		}
		const accountManager = new AccountManager()
		accountManager.archiveAccount(account)
		await this.uow.save(account)
	}
}
