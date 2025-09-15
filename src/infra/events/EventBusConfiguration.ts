import axios from "axios";
import { SingleForecastGeneratedDomainEvent } from "../../domain/sales_forecasting/events/SingleForecastGenerated.js";
import { ForecastApi } from "../services/ForecastAPI.js";
import { EventBus } from "./DomainEventBus.js";
import { singleForecastGeneratedDomainEventHandler } from "./handlers/SingleForecastGeneratedDomainEventHandler.js";

export const domainEventBus = new EventBus();
domainEventBus.register(singleForecastGeneratedDomainEventHandler);
