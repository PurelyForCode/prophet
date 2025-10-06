import { ApplicationException } from "./ApplicationException.js"

export class ResourceIsNotArchivedException extends ApplicationException {
	constructor(resourceName: string) {
		resourceName =
			resourceName.charAt(0).toUpperCase() +
			resourceName.slice(1).toLowerCase()
		super(`${resourceName} is not archived`, 409)
	}
}
