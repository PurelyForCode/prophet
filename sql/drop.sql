-- ===========================================
-- DROP ALL TABLES, TYPES, ENUMS (in reverse order) ===========================================


-- 1️⃣ Tables with dependencies on others
DROP TABLE IF EXISTS inventory_recommendation CASCADE;
DROP TABLE IF EXISTS forecast_entry CASCADE;
DROP TABLE IF EXISTS forecast CASCADE;

-- Prophet-related tables
DROP TABLE IF EXISTS prophet_setting_regressor CASCADE;
DROP TABLE IF EXISTS prophet_setting_holiday CASCADE; DROP TABLE IF EXISTS prophet_setting_changepoint CASCADE;
DROP TABLE IF EXISTS prophet_setting_season CASCADE;
DROP TABLE IF EXISTS prophet_model_setting CASCADE;
DROP TABLE IF EXISTS prophet_model CASCADE;

-- Croston-related tables
DROP TABLE IF EXISTS croston_model_setting CASCADE;
DROP TABLE IF EXISTS croston_model CASCADE;

-- Delivery-related tables
DROP TABLE IF EXISTS delivery_item CASCADE;
DROP TABLE IF EXISTS delivery CASCADE;

-- Supplier and product linkage
DROP TABLE IF EXISTS product_supplier CASCADE;
DROP TABLE IF EXISTS supplier CASCADE;

-- Sales and product config
DROP TABLE IF EXISTS sale CASCADE;
DROP TABLE IF EXISTS product_setting CASCADE;
DROP TABLE IF EXISTS product CASCADE;
DROP TABLE IF EXISTS product_group CASCADE;
DROP TABLE IF EXISTS product_category CASCADE;

-- Accounts and permissions
DROP TABLE IF EXISTS global_settings CASCADE;
DROP TABLE IF EXISTS recovery_token CASCADE;
DROP TABLE IF EXISTS account_permission CASCADE;
DROP TABLE IF EXISTS permission CASCADE;
DROP TABLE IF EXISTS account CASCADE;

-- Outbox
DROP TABLE IF EXISTS outbox_events CASCADE;

-- ===========================================
-- DROP ENUM TYPES
-- ===========================================
DROP TYPE IF EXISTS outbox_status CASCADE;
DROP TYPE IF EXISTS account_role CASCADE;
DROP TYPE IF EXISTS safety_stock_calculation_method CASCADE;
DROP TYPE IF EXISTS product_classification CASCADE;
DROP TYPE IF EXISTS sale_status CASCADE;
DROP TYPE IF EXISTS delivery_status CASCADE;
DROP TYPE IF EXISTS prophet_growth_type CASCADE;
DROP TYPE IF EXISTS changepoint_selection_method CASCADE;
DROP TYPE IF EXISTS seasonality_mode CASCADE;
DROP TYPE IF EXISTS model_type CASCADE;
DROP TYPE IF EXISTS inventory_status CASCADE;


DROP TABLE IF EXISTS session CASCADE;
-- ===========================================
-- ✅ Done
-- ===========================================
