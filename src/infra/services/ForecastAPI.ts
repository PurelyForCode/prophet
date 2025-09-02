import { Axios } from "axios";

export class ForecastAPI {
  constructor(private readonly axios: Axios) {}

  async generateForecast() {
    const url = process.env.FORECASTING_API_URL;
    if (!url) {
      throw new Error("Forecasting api url not declared");
    }
    await this.axios.post(url, {});
  }
}
