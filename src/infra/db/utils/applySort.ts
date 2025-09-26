import { Knex } from "knex";
import { ValueException } from "../../../core/exceptions/ValueException.js";
import { QuerySort } from "../types/queries/QuerySort.js";

export function applySort<T extends string>(
	builder: Knex.QueryBuilder,
	querySort: QuerySort<T> | undefined,
	sortFieldMap: Record<T, string>
) {
	if (!querySort) {
		return builder;
	}
	querySort.forEach((sortString) => {
		const [field, direction] = sortString.split(":") as [T, "asc" | "desc"];

		if (!(field in sortFieldMap)) {
			console.log("Unvalidated field made it through to the database layer");
			throw new ValueException("Unknown field declared in sort query params");
		}
		if (direction !== "asc" && direction !== "desc") {
			console.log("Badly formatted direction field made it through to the database layer");
			throw new ValueException("Bad formatting in direction field of a sort query param");
		}
		builder.orderBy(sortFieldMap[field], direction);
	});
	return builder;
}

