export type ProphetSettingRegressorDatabaseTable = {
	id: string
	model_setting_id: string
	regressor_name: string
	prior_scale: number | null
	standardize: boolean
	mode: "additive" | "multiplicative"
}
