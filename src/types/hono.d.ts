
import "hono"

declare module "hono" {
	interface ContextVariableMap {
		accountId: string
	}
}
