import axios, { AxiosInstance } from "axios";
import { EntityId } from "../../core/types/EntityId.js";
import { InternalServerError } from "../../core/exceptions/InternalServerError.js";
import { ApplicationException } from "../../core/exceptions/ApplicationException.js";

export class ForecastApiNotAvailable extends ApplicationException {
  constructor() {
    super("The forecasting api is not available", 500);
  }
}

export class ForecastApiDataError extends ApplicationException {
  constructor() {
    super("The forecasting api received invalid data", 500);
  }
}

type ForecastBody = {
  accountId: EntityId;
  forecastStartDate: Date;
  forecastEndDate: Date;
  dataStartDate: Date;
  dataEndDate: Date;
};

export class ForecastApi {
  private readonly axios: AxiosInstance;
  constructor(private readonly baseUrl: string) {
    this.axios = axios.create({
      baseURL: baseUrl,
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });
  }

  async generateForecast(params: {
    productId: EntityId;
    accountId: EntityId;
    forecastStartDate: Date;
    forecastEndDate: Date;
    dataStartDate: Date;
    dataEndDate: Date;
  }): Promise<EntityId> {
    const endpointUrl = this.baseUrl + "/forecasts" + "/" + params.productId;
    const body: ForecastBody = {
      accountId: params.accountId,
      forecastStartDate: params.forecastStartDate,
      forecastEndDate: params.forecastEndDate,
      dataStartDate: params.dataStartDate,
      dataEndDate: params.dataEndDate,
    };
    try {
      if (!(await this.isApiAvailable())) {
        throw new ForecastApiNotAvailable();
      }
      const result = await this.axios.post<{ data: EntityId }>(
        endpointUrl,
        body
      );
      return result.data.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.status === 400) {
          throw new ForecastApiDataError();
        } else {
          console.log("Unexpected error occurred");
          throw new InternalServerError();
        }
      } else {
        console.log("non axios error occurred");
        throw new InternalServerError();
      }
    }
  }

  async generateAllForecast(params: {
    accountId: EntityId;
    forecastStartDate: Date;
    forecastEndDate: Date;
    dataStartDate: Date;
    dataEndDate: Date;
  }) {
    const endpointUrl = this.baseUrl + "/forecasts";
    const body: ForecastBody = {
      accountId: params.accountId,
      forecastStartDate: params.forecastStartDate,
      forecastEndDate: params.forecastEndDate,
      dataStartDate: params.dataStartDate,
      dataEndDate: params.dataEndDate,
    };
    await this.axios.post(endpointUrl, body);
  }

  async isApiAvailable() {
    const result = await this.axios.get("/health");
    if (result.status === 200) {
      return true;
    } else {
      return false;
    }
  }
}

const url = process.env.FORECASTING_API_URL;
if (!url) {
  console.log("FORECASTING_API_URL environment variable is not declared");
  throw new InternalServerError();
}

export const forecastApi = new ForecastApi(url);
