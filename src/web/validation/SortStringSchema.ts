import { z } from "zod"
import { Sort } from "../../infra/db/utils/Sort.js"

export function sortStringSchema<T extends string>(validFields: Set<T>) {
	return z
		.string()
		.transform((val) =>
			val
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean),
		)
		.pipe(
			z.array(
				z
					.string()
					.regex(/^[-]?[a-zA-Z0-9_]+$/, "Invalid sort format")
					.refine((field) => {
						const clean = field.startsWith("-")
							? field.slice(1)
							: field
						return validFields.has(clean as T)
					}, "Invalid sort field"),
			),
		)
		.transform(
			(arr): Sort<T> => (arr.length > 0 ? (arr as Sort<T>) : undefined),
		)
		.nullish()
}
