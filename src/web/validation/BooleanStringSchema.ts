import { z } from "zod"

export const booleanStringSchema = z
	.string()
	.refine((val) => ["true", "false", "True", "False"].includes(val), {
		message: "Must be 'true', 'false', 'True', or 'False'",
	})
	.transform((val) => val.toLowerCase() === "true")
