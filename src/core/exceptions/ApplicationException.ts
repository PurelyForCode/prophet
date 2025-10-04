import { HTTPException } from "hono/http-exception"
import { ContentfulStatusCode } from "hono/utils/http-status"

export class ApplicationException extends Error {
	public readonly debugMessage: string | undefined
	public readonly statusCode: number

	constructor(message: string, statusCode: number) {
		super(message)
		this.statusCode = statusCode
		Error.captureStackTrace(this, this.constructor)
	}
}
