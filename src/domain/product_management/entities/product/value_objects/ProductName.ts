import { ValueException } from "../../../../../core/exceptions/ValueException.js"

export class ProductName {
	constructor(public readonly value: string) {
		if (!value || value.trim().length === 0) {
			throw new ValueException("Product name cannot be empty")
		}

		if (value.length > 100) {
			throw new ValueException(
				"Product name cannot be more than 100 characters",
			)
		}
	}

	static base() {
		return new ProductName("base")
	}
}
