import * as argon2 from "argon2"

export class PasswordUtility implements PasswordUtility {
	constructor() {}
	async hash(plainPassword: string) {
		return await argon2.hash(plainPassword)
	}

	async verify(hashed: string, plainPassword: string) {
		return await argon2.verify(hashed, plainPassword)
	}
}
