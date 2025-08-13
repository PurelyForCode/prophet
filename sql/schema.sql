CREATE TYPE outbox_status AS ENUM ('pending', 'sent', 'failed');

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
    'staff'
);

CREATE TABLE account(
    id UUID PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
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
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE product(
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES account(id) ON DELETE NO ACTION ON UPDATE CASCADE,
    product_category_id UUID REFERENCES product_category(id) ON DELETE SET NULL ON UPDATE CASCADE,
    name VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL DEFAULT(0),
    safety_stock INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE variant(
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES account(id) ON DELETE NO ACTION ON UPDATE CASCADE,
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE ON UPDATE CASCADE,
    name VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL DEFAULT(0),
    safety_stock INTEGER NOT NULL,
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
    variant_id UUID REFERENCES variant(id) ON DELETE CASCADE ON UPDATE CASCADE,
    safety_stock_calculation_method safety_stock_calculation_method NOT NULL,
    service_level INTEGER NOT NULL, 
    fill_rate INTEGER NOT NULL,
    classification product_classification NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TYPE sale_status AS ENUM ('completed', 'in_progress', 'cancelled');

CREATE TABLE sale (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES account(id) ON DELETE NO ACTION ON UPDATE CASCADE,
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE ON UPDATE CASCADE,
    variant_id UUID REFERENCES variant(id) ON DELETE CASCADE ON UPDATE CASCADE,
    quantity INTEGER NOT NULL,
    status sale_status NOT NULL,
    date DATE NOT NULL, 
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE supplier (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES account(id),
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
    variant_id UUID REFERENCES variant(id) ON DELETE CASCADE ON UPDATE CASCADE,
    min_orderable INTEGER,
    max_orderable INTEGER,

    UNIQUE (product_id, supplier_id, variant_id)
);

CREATE TYPE delivery_status AS ENUM (
    'completed',
    'delivering',
    'cancelled'
);

CREATE TABLE delivery (
    id UUID PRIMARY KEY,
    supplier_id UUID NOT NULL REFERENCES supplier(id),
    account_id UUID NOT NULL REFERENCES account(id),
    status delivery_status NOT NULL DEFAULT 'delivering',
    completed_at TIMESTAMPTZ,
    delivery_requested_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    cancelled_at TIMESTAMPTZ,
    scheduled_arrival_date TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
    deleted_at TIMESTAMPTZ
);

CREATE TABLE delivery_item (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES product(id),
    variant_id UUID NOT NULL REFERENCES variant(id),
    delivery_id UUID NOT NULL REFERENCES delivery(id),
    quantity INTEGER NOT NULL,
);

CREATE TABLE sales_forecast(
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES product(id),
    variant_id UUID REFERENCES variant(id),
    account_id UUID NOT NULL REFERENCES account(id),
    data_start_date DATE,
    data_end_date DATE,
    forecast_start_date DATE NOT NULL,
    forecast_end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE sales_forecast_entry(
    id UUID PRIMARY KEY,
    sales_forecast_id UUID NOT NULL REFERENCES sales_forecast(id),
    yhat FLOAT NOT NULL,
    yhat_upper FLOAT NOT NULL,
    yhat_lower FLOAT NOT NULL,
    date DATE NOT NULL
);

INSERT INTO account (id, username, password, email, role) VALUES ('01970607-cdb9-7209-bf1d-f1281b9cc056', 'test', 'password', 'test@gmail.com', 'store manager');