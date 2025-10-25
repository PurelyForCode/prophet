import { ApplicationException } from "./ApplicationException.js"

export class CanNotCombineIncludeAndArchivedException extends ApplicationException {
	constructor() {
		super("Can not combine include and archived in query param", 409)
	}
}
