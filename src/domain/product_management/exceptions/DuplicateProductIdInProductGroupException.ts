
import { ApplicationException } from "../../../core/exceptions/ApplicationException.js";

export class DuplicateProductIdInProductGroupException extends ApplicationException {
	constructor() {
		super("Product id was duplicated in product group, retry request", 500);
	}
}
