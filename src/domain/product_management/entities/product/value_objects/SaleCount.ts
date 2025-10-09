import { InternalServerError } from "../../../../../core/exceptions/InternalServerError.js"

export class SaleCount {
	constructor(public readonly value: number) {
		if (value < 0) {
			console.log("Sale count is initialized as zero")
			throw new InternalServerError()
		}
	}
}
