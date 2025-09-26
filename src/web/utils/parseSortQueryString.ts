import { ValueException } from "../../core/exceptions/ValueException.js"
import { QuerySort, SortDirection } from "../../infra/db/types/queries/QuerySort.js"


export function parseSortQueryString<T extends string>(
	sortString: string,
	allowedFields: T[]
): QuerySort<T> {
	if (!sortString || sortString.trim().length === 0) {
		throw new ValueException("Sort query parameter cannot be empty")
	}

	const sortRegex = /^[a-zA-Z0-9_]+:(asc|desc)(;[a-zA-Z0-9_]+:(asc|desc))*$/
	if (!sortRegex.test(sortString.trim())) {
		throw new ValueException("Sort query parameter has bad formatting")
	}

	const parts = sortString.split(";") // ["field:asc", "other:desc"]

	const parsed = parts.map(part => {
		const [field, direction] = part.split(":") as [string, SortDirection]

		if (!allowedFields.includes(field as T)) {
			throw new ValueException(`Invalid sort field: ${field}`)
		}

		return `${field}:${direction}` as `${T}:${SortDirection}`
	})

	return parsed
}
