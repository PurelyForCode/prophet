import { DomainEventBus } from "./DomainEventBus.js";

export const domainEventBus = new DomainEventBus();
domainEventBus.register();
