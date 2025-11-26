import axios, { AxiosInstance, AxiosResponse } from "axios"
import { EntityId } from "../../core/types/EntityId.js"
import { InternalServerError } from "../../core/exceptions/InternalServerError.js"
import { ApplicationException } from "../../core/exceptions/ApplicationException.js"
import {
	GenerateAllForecastInput,
	GenerateForecastInput,
	IForecastApi,
} from "../../application/interfaces/IForecastApi.js"

export class ForecastApiNotAvailable extends ApplicationException {
	constructor() {
		super("The forecasting api is not available", 500)
	}
}

export class ForecastApiError extends ApplicationException {
	constructor(msg: string, statusCode: number) {
		super(msg, statusCode)
	}
}

export class ForecastApi implements IForecastApi {
	private readonly axios: AxiosInstance
	constructor(private readonly baseUrl: string) {
		this.axios = axios.create({
			baseURL: baseUrl,
			headers: { "Content-Type": "application/json" },
			timeout: 10000,
		})
	}

	async generateForecast(params: GenerateForecastInput): Promise<EntityId> {
		const endpointUrl = this.baseUrl + "/forecasts" + "/" + params.productId
		try {
			if (!(await this.isApiAvailable())) {
				throw new ForecastApiNotAvailable()
			}
			type RequestBody = Omit<GenerateForecastInput, "productId">
			type ResponseBody = { data: EntityId }
			const result = await this.axios.post<
				ResponseBody,
				AxiosResponse<ResponseBody>,
				RequestBody
			>(endpointUrl, {
				accountId: params.accountId,
				dataDepth: params.dataDepth,
				forecastId: params.forecastId,
				forecastEndDate: params.forecastEndDate,
				forecastStartDate: params.forecastStartDate,
				forecastingMethod: params.forecastingMethod,
			})
			return result.data.data
		} catch (err) {
			if (axios.isAxiosError(err)) {
				console.log(err.message)
				const status = err.response?.status ?? 500
				const detail =
					err.response?.data?.detail?.message ?? "Unknown error"
				throw new ForecastApiError(detail, status)
			} else if (err instanceof ApplicationException) {
				throw err
			} else {
				throw new InternalServerError()
			}
		}
	}

	async generateAllForecasts(params: GenerateAllForecastInput) {
		const endpointUrl = this.baseUrl + "/forecasts"
		await this.axios.post(endpointUrl, params)
	}

	async isApiAvailable() {
		const result = await this.axios.get("/healthcheck")
		if (result.status === 200) {
			return true
		} else {
			return false
		}
	}
}

const url = process.env.FORECASTING_API_URL
if (!url) {
	console.log("FORECASTING_API_URL environment variable is not declared")
	throw new InternalServerError()
}

export const forecastApi = new ForecastApi(url)
