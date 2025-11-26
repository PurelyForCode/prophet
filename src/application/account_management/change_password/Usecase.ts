import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { Password } from "../../../domain/account_management/entities/account/value_objects/Password.js"
import { AccountNotFoundException } from "../../../domain/account_management/exceptions/AccountNotFoundException.js"
import { AccountPerformingRequestNotFoundException } from "../../../domain/account_management/exceptions/AccountPerformingRequestNotFound.js"
import { AuthorizationException } from "../../../domain/account_management/exceptions/AuthorizationException.js"
import { PasswordUtility } from "../../../infra/utils/PasswordUtility.js"

export type ChangePasswordInput = {
	accountId: EntityId
	actorId: EntityId
	password: string
}

export class ChangePasswordUsecase {
	constructor(
		private readonly uow: IUnitOfWork,
		private readonly passwordUtility: PasswordUtility,
	) {}
	async call(input: ChangePasswordInput) {
		const accountRepo = this.uow.getAccountRepository()
		const actor = await accountRepo.findById(input.actorId)
		if (!actor) {
			throw new AccountPerformingRequestNotFoundException()
		}
		const account = await accountRepo.findById(input.accountId)
		if (!account) {
			throw new AccountNotFoundException()
		}

		if (account.id !== input.actorId) {
			throw new AuthorizationException()
		}

		const hash = await this.passwordUtility.hash(input.password)
		account.changePassword(new Password(hash))
		await this.uow.save(account)
	}
}
