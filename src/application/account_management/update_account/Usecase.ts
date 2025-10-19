import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { AccountNotFoundException } from "../../../domain/account_management/exceptions/AccountNotFoundException.js"
import { AccountManager } from "../../../domain/account_management/services/AccountManager.js"

export type UpdateAccountInput = {
	accountId: EntityId
	fields: Partial<{
		username: string
		role: string
	}>
}

export class UpdateAccountUsecase {
	constructor(private readonly uow: IUnitOfWork) {}
	async call(input: UpdateAccountInput) {
		const accountRepo = this.uow.getAccountRepository()
		const account = await accountRepo.findById(input.accountId)
		if (!account) {
			throw new AccountNotFoundException()
		}

		const permissionRepo = this.uow.getPermissionRepository()
		const accountManager = new AccountManager()

		await accountManager.updateAccount(
			permissionRepo,
			accountRepo,
			account,
			input.fields,
		)
		await this.uow.save(account)
	}
}
