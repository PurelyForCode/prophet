import { ValueException } from "../../core/exceptions/ValueException.js";

// Format "field1,field2,field3"
export function parseIncludeQueryString(include: string, allowedFields: string[]): Record<string, boolean> {
	if (!include || include.trim().length === 0) {
		throw new ValueException("Include query parameter cannot be empty")
	}

	if (!/^[a-zA-Z0-9_]+(,[a-zA-Z0-9_]+)*$/.test(include.trim())) {
		throw new ValueException("Include query parameter has bad formatting")
	}

	return include
		.split(",")
		.map(v => v.trim())
		.filter(v => v.length > 0)
		.reduce<Record<string, boolean>>(
			(acc, val) => {
				if (allowedFields.includes(val)) {
					acc[val] = true;
					return acc;
				} else {
					throw new ValueException("Invalid include query param field")
				}
			}, {}
		);
}
