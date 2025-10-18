import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { PermissionGranteeNotFoundException } from "../../../domain/account_management/exceptions/PermissionGranteeNotFoundException.js"
import { PermissionNotFoundException } from "../../../domain/account_management/exceptions/PermissionNotFoundException.js"

export type RevokePermissionInput = {
	accountId: EntityId
	granteeId: EntityId
	permissionId: EntityId
}

export class RevokePermissionUsecase {
	constructor(private readonly uow: IUnitOfWork) {}
	async call(input: RevokePermissionInput) {
		const accountRepo = this.uow.getAccountRepository()
		const grantee = await accountRepo.findById(input.granteeId)
		if (!grantee) {
			throw new PermissionGranteeNotFoundException()
		}

		const permissionRepository = this.uow.getPermissionRepository()
		const permission = await permissionRepository.findById(
			input.permissionId,
		)
		if (!permission) {
			throw new PermissionNotFoundException()
		}
		grantee.revokePermission(permission)
		await this.uow.save(grantee)
	}
}
