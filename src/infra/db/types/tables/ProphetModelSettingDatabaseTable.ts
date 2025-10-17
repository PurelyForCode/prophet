export type ProphetModelSettingDatabaseTable = {
	id: string // UUID
	prophet_model_id: string // UUID (FK → prophet_model.id)

	growth_type: "linear" | "logistic"
	cap_enabled: boolean

	changepoint_selection_method: "auto" | "manual"
	n_changepoints: number | null
	changepoint_prior_scale: number | null
	changepoint_range: number | null

	yearly_seasonality: boolean | null
	weekly_seasonality: boolean | null
	daily_seasonality: boolean | null

	seasonality_mode: "additive" | "multiplicative" | null
	seasonality_prior_scale: number | null
	holidays_prior_scale: number | null

	interval_width: number // defaults to 0.8
	uncertainty_samples: number // defaults to 1000
	seed: number | null

	created_at: Date
}
