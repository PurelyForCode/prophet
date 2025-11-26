import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { Usecase } from "../../../core/interfaces/Usecase.js"
import { PasswordUtility } from "../../../infra/utils/PasswordUtility.js"
import { Username } from "../../../domain/account_management/entities/account/value_objects/Username.js"
import { AccountNotFoundException } from "../../../domain/account_management/exceptions/AccountNotFoundException.js"
import { IncorrectPasswordException } from "../../../domain/account_management/exceptions/IncorrectPasswordException.js"
import { Account } from "../../../domain/account_management/entities/account/Account.js"

export type LoginInput = {
	username: string
	password: string
}
export class LoginUsecase implements Usecase<LoginInput, any> {
	constructor(
		private uow: IUnitOfWork,
		private passwordUtility: PasswordUtility,
	) {}

	async call(input: LoginInput): Promise<Account> {
		const accountDao = this.uow.getAccountRepository()
		const account = await accountDao.findByUsername(
			new Username(input.username),
		)
		if (!account) {
			throw new AccountNotFoundException()
		}
		const hashedPassword = account.password
		if (
			!(await this.passwordUtility.verify(
				hashedPassword.value,
				input.password,
			))
		) {
			throw new IncorrectPasswordException()
		}
		return account
	}
}
