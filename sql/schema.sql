CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE session (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TYPE outbox_status AS ENUM ('pending', 'sent', 'failed');

CREATE TABLE global_settings (
	id SERIAL PRIMARY KEY,
	coverage_days INTEGER NOT NULL DEFAULT 14,
	prophet_interval_width INTEGER NOT NULL DEFAULT 80,
	service_level NUMERIC(4,3) NOT NULL DEFAULT 0.950,
	sales_decrement_stock BOOLEAN NOT NULL DEFAULT TRUE,
	deliveries_increment_stock BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE outbox_events (
    id UUID PRIMARY KEY NOT NULL,
    aggregate_type TEXT NOT NULL,          -- e.g., 'Product'
    aggregate_id UUID NOT NULL,            -- e.g., the Product ID
    type TEXT NOT NULL,                    -- e.g., 'ProductCreated'
    payload JSONB NOT NULL,                -- the serialized event data
    status outbox_status NOT NULL DEFAULT 'pending',-- 'pending', 'sent', 'failed'
    retries INTEGER NOT NULL DEFAULT 0,    -- for retry logic
    error TEXT,                            -- store last error message if failed
    next_retry_at TIMESTAMP WITH TIME ZONE,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE  -- when it was successfully processed
);

CREATE TYPE account_role AS ENUM (
    'store manager',
    'admin',
    'superadmin',
    'staff'
);

CREATE TABLE account(
    id UUID PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role account_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE permission(
    id UUID PRIMARY KEY,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE account_permission (
    account_id UUID REFERENCES account(id) ON DELETE CASCADE ON UPDATE CASCADE,
    permission_id UUID REFERENCES permission(id) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (account_id, permission_id)
);

CREATE TABLE recovery_token(
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE ON UPDATE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    used BOOLEAN NOT NULL
);

CREATE TABLE product_category(
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE product_group(
    id UUID PRIMARY KEY,
    account_id UUID REFERENCES account(id)  ON DELETE SET NULL ON UPDATE CASCADE,
    product_category_id UUID REFERENCES product_category(id) ON DELETE SET NULL ON UPDATE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE product(
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES account(id) ON DELETE NO ACTION ON UPDATE CASCADE,
    group_id UUID NOT NULL REFERENCES product_group(id) ON DELETE CASCADE ON UPDATE CASCADE,
    name VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL DEFAULT(0),
    safety_stock INTEGER NOT NULL,
	sale_count INTEGER NOT NULL DEFAULT(0),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TYPE safety_stock_calculation_method AS ENUM (
    'manual',
    'dynamic',
    'historical'
);

CREATE TYPE product_classification AS ENUM (
    'fast',
    'slow'
);

CREATE TABLE product_setting(
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE ON UPDATE CASCADE,
    safety_stock_calculation_method safety_stock_calculation_method NOT NULL,
    service_level INTEGER NOT NULL, 
    fill_rate INTEGER NOT NULL,
    classification product_classification NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TYPE sale_status AS ENUM ('completed', 'pending', 'cancelled');

CREATE TABLE sale (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES account(id) ON DELETE NO ACTION ON UPDATE CASCADE,
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE ON UPDATE CASCADE,
    quantity INTEGER NOT NULL,
    status sale_status NOT NULL,
    date DATE NOT NULL, 
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE supplier (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES account(id) ON DELETE SET NULL ON UPDATE CASCADE,
    name VARCHAR(100) NOT NULL,
    lead_time INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE product_supplier (
	id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE ON UPDATE CASCADE,
    supplier_id UUID NOT NULL REFERENCES supplier(id) ON DELETE CASCADE ON UPDATE CASCADE,
    min_orderable INTEGER,
    max_orderable INTEGER,
    is_default BOOLEAN NOT NULL
);

CREATE TYPE delivery_status AS ENUM (
    'completed',
    'pending',
    'cancelled'
);

CREATE TABLE delivery (
    id UUID PRIMARY KEY,
    supplier_id UUID NOT NULL REFERENCES supplier(id) ON DELETE CASCADE ON UPDATE CASCADE,
    account_id UUID NOT NULL REFERENCES account(id) ON DELETE SET NULL ON UPDATE CASCADE,
    status delivery_status NOT NULL DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    requested_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    cancelled_at TIMESTAMPTZ,
    scheduled_arrival_date TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE delivery_item (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE ON UPDATE CASCADE,
    delivery_id UUID NOT NULL REFERENCES delivery(id) ON DELETE CASCADE ON UPDATE CASCADE,
    quantity INTEGER NOT NULL
);

CREATE TABLE croston_model (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    trained_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
-- =========================================================
-- Model versioning and file tracking
-- =========================================================
CREATE TABLE prophet_model (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE ON UPDATE CASCADE,
	name VARCHAR(100) NOT NULL,
    file_path TEXT,           -- null when model is not activated
    active BOOLEAN NOT NULL DEFAULT TRUE,
    trained_at TIMESTAMPTZ
);

CREATE TYPE prophet_growth_type AS ENUM('linear', 'logistic');
CREATE TYPE changepoint_selection_method AS ENUM ('auto', 'manual');
CREATE TYPE seasonality_mode AS ENUM ('additive', 'multiplicative');


CREATE TABLE prophet_model_setting (
    id UUID PRIMARY KEY,
	prophet_model_id UUID NOT NULL REFERENCES prophet_model(id) ON DELETE CASCADE ON UPDATE CASCADE,

    growth_type prophet_growth_type NOT NULL DEFAULT 'linear',          -- 'linear' or 'logistic'
    cap_enabled BOOLEAN NOT NULL DEFAULT FALSE,          -- TRUE if logistic growth is used

    -- Trend changepoints
    changepoint_selection_method TEXT NOT NULL DEFAULT 'auto'
        CHECK (changepoint_selection_method IN ('auto', 'manual')),
    n_changepoints INTEGER,                              -- only used when method = 'auto'
    changepoint_prior_scale NUMERIC(12,6),               -- controls flexibility of trend
    changepoint_range NUMERIC(5,4),                      -- fraction (e.g. 0.8 of history to consider)

    -- Seasonalities
    yearly_seasonality BOOLEAN,
    weekly_seasonality BOOLEAN,
    daily_seasonality BOOLEAN,

    seasonality_mode seasonality_mode,                               -- 'additive' or 'multiplicative'
    seasonality_prior_scale NUMERIC(12,6),               -- global seasonal prior scale
    holidays_prior_scale NUMERIC(12,6),                  -- controls strength of holiday effects

    -- Uncertainty / intervals
    interval_width NUMERIC(5,4) DEFAULT 0.8,             -- default coverage level (e.g. 0.8, 0.95)
    uncertainty_samples INTEGER DEFAULT 1000,            -- posterior predictive draws
    seed INTEGER,                                        -- random seed for reproducibility

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =========================================================
-- Seasonality configuration (custom or default)
-- =========================================================
CREATE TABLE prophet_setting_season (
    id UUID PRIMARY KEY,
    model_setting_id UUID NOT NULL REFERENCES prophet_model_setting(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    period_days NUMERIC NOT NULL,      
    fourier_order INTEGER NOT NULL,
    prior_scale NUMERIC(12,6),         
    mode TEXT							
);


-- =========================================================
-- Explicit changepoint overrides
-- =========================================================
CREATE TABLE prophet_setting_changepoint (
    id UUID PRIMARY KEY,
    model_setting_id UUID NOT NULL REFERENCES prophet_model_setting(id) ON DELETE CASCADE,
    changepoint_date DATE NOT NULL
);


-- =========================================================
-- Holidays / special events
-- =========================================================
CREATE TABLE prophet_setting_holiday (
    id UUID PRIMARY KEY,
    model_setting_id UUID NOT NULL REFERENCES prophet_model_setting(id) ON DELETE CASCADE,

    holiday_name TEXT NOT NULL,
    ds DATE NOT NULL,
    lower_window INTEGER NOT NULL DEFAULT 0,
    upper_window INTEGER NOT NULL DEFAULT 0
);

CREATE TYPE model_type AS ENUM ('prophet', 'croston'); 

CREATE TABLE forecast(
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE ON UPDATE CASCADE,
    account_id UUID NOT NULL REFERENCES account(id) ON DELETE SET NULL ON UPDATE CASCADE,
	prophet_model_id UUID REFERENCES prophet_model(id) ON DELETE SET NULL ON UPDATE SET NULL,
	croston_model_id UUID REFERENCES croston_model(id) ON DELETE SET NULL ON UPDATE SET NULL,
	model_type model_type NOT NULL,
    data_depth INT NOT NULL DEFAULT(100),
    forecast_start_date DATE NOT NULL,
    forecast_end_date DATE NOT NULL,
    processed boolean DEFAULT(false) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE forecast_entry(
    id UUID PRIMARY KEY,
    forecast_id UUID NOT NULL REFERENCES forecast(id) ON DELETE CASCADE ON UPDATE CASCADE,
    yhat FLOAT NOT NULL,
    yhat_upper FLOAT NOT NULL,
    yhat_lower FLOAT NOT NULL,
    date DATE NOT NULL
);

CREATE TYPE inventory_status AS ENUM('critical', 'urgent', 'warning', 'good');

CREATE TABLE inventory_recommendation (
    id UUID PRIMARY KEY,
    forecast_id UUID NOT NULL REFERENCES forecast(id) ON DELETE CASCADE ON UPDATE CASCADE,
    supplier_id UUID NOT NULL REFERENCES supplier(id) ON DELETE CASCADE ON UPDATE CASCADE,
	status inventory_status NOT NULL,
	leadtime INTEGER NOT NULL,
    runs_out_at DATE NOT NULL,
    restock_at DATE NOT NULL,
    restock_amount INTEGER NOT NULL,
    coverage_days INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO account (id, username, password, role) VALUES ('01970607-cdb9-7209-bf1d-f1281b9cc056', 'test', 'password', 'store manager');
