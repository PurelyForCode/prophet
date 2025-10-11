import { InternalServerError } from "./InternalServerError.js"
import { ValueException } from "./ValueException.js"

export class InvalidEntityCreated extends InternalServerError {
	constructor(error: ValueException) {
		super()
		console.log("Entity created is invalid")
		console.error(error.message)
	}
}
