export type ProphetSettingSeasonDatabaseTable = {
	id: string // UUID
	model_setting_id: string // UUID (FK → prophet_model_setting.id)

	name: string
	period_days: number // seasonal period in days
	fourier_order: number // number of Fourier terms
	prior_scale: number | null // optional per-seasonality prior scale
	mode: "additive" | "multiplicative" | null // seasonality mode
	condition_name: string | null // for conditional seasonalities
}
