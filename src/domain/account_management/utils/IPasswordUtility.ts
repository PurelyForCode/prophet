export interface IPasswordUtility {
	hash(plainPassword: string): Promise<string>
	verify(hashed: string, plainPassword: string): Promise<boolean>
}
