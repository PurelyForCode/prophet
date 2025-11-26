import { Store, SessionData } from "hono-sessions"
import { Knex } from "knex"

export class PostgresqlSessionStore implements Store {
	constructor(private readonly knex: Knex) {}

	async getSessionById(sessionId?: string): Promise<SessionData | null> {
		if (!sessionId) return null

		const session = await this.knex("session")
			.where("id", sessionId)
			.andWhere("expires_at", ">", this.knex.fn.now())
			.first()

		if (!session) return null

		return session.data as SessionData
	}

	async createSession(
		sessionId: string,
		initialData: SessionData,
	): Promise<void> {
		const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24) // 1 day default

		await this.knex("session").insert({
			id: sessionId,
			data: JSON.stringify(initialData),
			expires_at: expiresAt,
		})
	}

	async persistSessionData(
		sessionId: string,
		sessionData: SessionData,
	): Promise<void> {
		const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24) // reset expiry

		await this.knex("session")
			.insert({
				id: sessionId,
				data: JSON.stringify(sessionData),
				expires_at: expiresAt,
			})
			.onConflict("id")
			.merge(["data", "expires_at"])
	}

	async deleteSession(sessionId: string): Promise<void> {
		await this.knex("session").where("id", sessionId).del()
	}
}
