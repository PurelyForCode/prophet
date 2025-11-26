import { IRepository } from "../../../core/interfaces/Repository.js"
import { Account } from "../entities/account/Account.js"
import { Username } from "../entities/account/value_objects/Username.js"

export interface IAccountRepository extends IRepository<Account> {
	findByUsername(username: Username): Promise<Account | null>
	doesSuperAdminExist(): Promise<boolean>
}
