import axios from "axios";
import { SingleForecastGeneratedDomainEvent } from "../../domain/sales_forecasting/events/SingleForecastGenerated.js";
import { ForecastApi } from "../services/ForecastAPI.js";
import { DomainEventBus } from "./DomainEventBus.js";
import { singleForecastGeneratedDomainEventHandler } from "./handlers/SingleForecastGeneratedDomainEventHandler.js";

export const domainEventBus = new DomainEventBus();
domainEventBus.register(singleForecastGeneratedDomainEventHandler);
