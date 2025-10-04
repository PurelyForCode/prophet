import { z } from "zod"

export function includeStringSchema(validFields: Set<string>) {
	return z
		.string()
		.transform((val) =>
			val
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean),
		)
		.pipe(
			z
				.array(
					z.string().refine((field) => validFields.has(field), {
						message: "Invalid include field",
					}),
				)
				.refine((arr) => new Set(arr).size === arr.length, {
					message: "Duplicate values in include field",
				})
				.transform((arr) =>
					Object.fromEntries(arr.map((key) => [key, true])),
				),
		)
}
