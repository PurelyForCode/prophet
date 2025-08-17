import { ApplicationException } from "./ApplicationException.js";

export class ResourceIsArchivedException extends ApplicationException {
  constructor(resourceName: string) {
    resourceName =
      resourceName.charAt(0).toUpperCase() +
      resourceName.slice(1).toLowerCase();
    super(`${resourceName} is archived, action is not allowed`, 409);
  }
}
