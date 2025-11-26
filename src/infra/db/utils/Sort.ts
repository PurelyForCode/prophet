import { Knex } from "knex"

export type Sort<T extends string> = (T | `-${T}`)[] | undefined | null

export function sortQuery<T extends string>(
	builder: Knex.QueryBuilder,
	sort: Sort<T>,
	fieldMap: Record<T, string>,
) {
	if (!sort) {
		return builder
	}
	for (const sortString of sort) {
		let field: string = sortString
		let isDesc = false
		if (sortString[0] === "-") {
			field = sortString.slice(1)
			isDesc = true
		}
		if (fieldMap[field as T]) {
			builder.orderBy(fieldMap[field as T]!, isDesc ? "desc" : "asc")
		}
	}
}
