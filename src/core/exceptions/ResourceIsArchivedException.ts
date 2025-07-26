import { ApplicationException } from "./ApplicationException.js";

export class ResourceIsArchivedException extends ApplicationException {
  constructor(resourceName: string) {
    super(`${resourceName} is archived, action is not allowed`, 403);
  }
}
