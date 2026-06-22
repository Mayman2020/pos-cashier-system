-- V1: POS Cashier System — initial schema (pos_mgmt)

CREATE SCHEMA IF NOT EXISTS pos_mgmt;
SET search_path = pos_mgmt;

CREATE TABLE roles (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(100) UNIQUE NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(150),
    phone           VARCHAR(30),
    branch_id       BIGINT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    last_login      TIMESTAMP,
    last_login_ip   VARCHAR(64),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100)
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE branches (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(30) UNIQUE NOT NULL,
    name        VARCHAR(150) NOT NULL,
    address     VARCHAR(500),
    phone       VARCHAR(30),
    email       VARCHAR(150),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100)
);

ALTER TABLE users ADD CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES branches(id);

CREATE TABLE units (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(30) UNIQUE NOT NULL,
    name        VARCHAR(100) NOT NULL,
    symbol      VARCHAR(20),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    color       VARCHAR(20),
    sort_order  INT NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100)
);

CREATE TABLE suppliers (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(30) UNIQUE NOT NULL,
    name        VARCHAR(200) NOT NULL,
    phone       VARCHAR(30),
    email       VARCHAR(150),
    address     VARCHAR(500),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100)
);

CREATE TABLE customers (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(30) UNIQUE,
    name        VARCHAR(200) NOT NULL,
    phone       VARCHAR(30),
    email       VARCHAR(150),
    address     VARCHAR(500),
    loyalty_points INT NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100)
);

CREATE TABLE products (
    id              BIGSERIAL PRIMARY KEY,
    sku             VARCHAR(50) UNIQUE NOT NULL,
    barcode         VARCHAR(100),
    name            VARCHAR(200) NOT NULL,
    description     VARCHAR(1000),
    category_id     BIGINT REFERENCES categories(id),
    unit_id         BIGINT REFERENCES units(id),
    cost_price      NUMERIC(14,2) NOT NULL DEFAULT 0,
    selling_price   NUMERIC(14,2) NOT NULL DEFAULT 0,
    tax_rate        NUMERIC(5,2) NOT NULL DEFAULT 0,
    track_stock     BOOLEAN NOT NULL DEFAULT TRUE,
    low_stock_threshold NUMERIC(14,3) NOT NULL DEFAULT 5,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    image_url       VARCHAR(500),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100)
);

CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category_id);

CREATE TABLE product_variants (
    id              BIGSERIAL PRIMARY KEY,
    product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku             VARCHAR(50) UNIQUE NOT NULL,
    barcode         VARCHAR(100),
    name            VARCHAR(200) NOT NULL,
    cost_price      NUMERIC(14,2) NOT NULL DEFAULT 0,
    selling_price   NUMERIC(14,2) NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE product_modifiers (
    id              BIGSERIAL PRIMARY KEY,
    product_id      BIGINT REFERENCES products(id) ON DELETE CASCADE,
    name            VARCHAR(150) NOT NULL,
    price_adjustment NUMERIC(14,2) NOT NULL DEFAULT 0,
    modifier_group  VARCHAR(100),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE taxes (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(30) UNIQUE NOT NULL,
    name        VARCHAR(100) NOT NULL,
    rate        NUMERIC(5,2) NOT NULL,
    is_default  BOOLEAN NOT NULL DEFAULT FALSE,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE discounts (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(30) UNIQUE NOT NULL,
    name            VARCHAR(150) NOT NULL,
    discount_type   VARCHAR(20) NOT NULL CHECK (discount_type IN ('PERCENT','FIXED')),
    value           NUMERIC(14,2) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE restaurant_tables (
    id          BIGSERIAL PRIMARY KEY,
    branch_id   BIGINT NOT NULL REFERENCES branches(id),
    table_number VARCHAR(30) NOT NULL,
    capacity    INT NOT NULL DEFAULT 4,
    status      VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE','OCCUPIED','RESERVED')),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (branch_id, table_number)
);

CREATE TABLE inventory_balances (
    id              BIGSERIAL PRIMARY KEY,
    branch_id       BIGINT NOT NULL REFERENCES branches(id),
    product_id      BIGINT NOT NULL REFERENCES products(id),
    quantity        NUMERIC(14,3) NOT NULL DEFAULT 0,
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (branch_id, product_id)
);

CREATE TABLE stock_movements (
    id              BIGSERIAL PRIMARY KEY,
    branch_id       BIGINT NOT NULL REFERENCES branches(id),
    product_id      BIGINT NOT NULL REFERENCES products(id),
    movement_type   VARCHAR(30) NOT NULL CHECK (movement_type IN ('STOCK_IN','SALE','ADJUSTMENT','TRANSFER_OUT','TRANSFER_IN','RETURN')),
    quantity        NUMERIC(14,3) NOT NULL,
    reference_type  VARCHAR(50),
    reference_id    BIGINT,
    notes           VARCHAR(500),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(100)
);

CREATE INDEX idx_stock_movements_branch_product ON stock_movements(branch_id, product_id);

CREATE TABLE shifts (
    id                  BIGSERIAL PRIMARY KEY,
    branch_id           BIGINT NOT NULL REFERENCES branches(id),
    cashier_id          BIGINT NOT NULL REFERENCES users(id),
    status              VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','CLOSED')),
    opened_at           TIMESTAMP NOT NULL DEFAULT NOW(),
    closed_at           TIMESTAMP,
    opening_cash        NUMERIC(14,2) NOT NULL DEFAULT 0,
    expected_cash       NUMERIC(14,2),
    actual_cash         NUMERIC(14,2),
    cash_difference     NUMERIC(14,2),
    total_sales         NUMERIC(14,2) NOT NULL DEFAULT 0,
    notes               VARCHAR(500),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE cash_drawer_movements (
    id              BIGSERIAL PRIMARY KEY,
    shift_id        BIGINT NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    movement_type   VARCHAR(30) NOT NULL CHECK (movement_type IN ('OPENING','SALE','REFUND','PAYOUT','CLOSING')),
    amount          NUMERIC(14,2) NOT NULL,
    notes           VARCHAR(500),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(100)
);

CREATE TABLE pos_orders (
    id                  BIGSERIAL PRIMARY KEY,
    order_number        VARCHAR(50) UNIQUE NOT NULL,
    branch_id           BIGINT NOT NULL REFERENCES branches(id),
    shift_id            BIGINT REFERENCES shifts(id),
    cashier_id          BIGINT NOT NULL REFERENCES users(id),
    customer_id         BIGINT REFERENCES customers(id),
    table_id            BIGINT REFERENCES restaurant_tables(id),
    order_type          VARCHAR(20) NOT NULL DEFAULT 'RETAIL' CHECK (order_type IN ('DINE_IN','TAKEAWAY','DELIVERY','RETAIL')),
    status              VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','HELD','PENDING','PREPARING','READY','SERVED','PAID','CANCELLED','REFUNDED')),
    kitchen_status      VARCHAR(20) CHECK (kitchen_status IN ('PENDING','PREPARING','READY','SERVED')),
    subtotal            NUMERIC(14,2) NOT NULL DEFAULT 0,
    discount_amount     NUMERIC(14,2) NOT NULL DEFAULT 0,
    tax_amount          NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_amount        NUMERIC(14,2) NOT NULL DEFAULT 0,
    paid_amount         NUMERIC(14,2) NOT NULL DEFAULT 0,
    notes               VARCHAR(1000),
    held_at             TIMESTAMP,
    paid_at             TIMESTAMP,
    cancelled_at        TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100)
);

CREATE INDEX idx_pos_orders_status ON pos_orders(status);
CREATE INDEX idx_pos_orders_branch ON pos_orders(branch_id);
CREATE INDEX idx_pos_orders_created ON pos_orders(created_at);

CREATE TABLE pos_order_items (
    id                  BIGSERIAL PRIMARY KEY,
    order_id            BIGINT NOT NULL REFERENCES pos_orders(id) ON DELETE CASCADE,
    product_id          BIGINT NOT NULL REFERENCES products(id),
    variant_id          BIGINT REFERENCES product_variants(id),
    product_name        VARCHAR(200) NOT NULL,
    quantity            NUMERIC(14,3) NOT NULL DEFAULT 1,
    unit_price          NUMERIC(14,2) NOT NULL,
    discount_amount     NUMERIC(14,2) NOT NULL DEFAULT 0,
    tax_amount          NUMERIC(14,2) NOT NULL DEFAULT 0,
    line_total          NUMERIC(14,2) NOT NULL,
    kitchen_status      VARCHAR(20) CHECK (kitchen_status IN ('PENDING','PREPARING','READY','SERVED')),
    notes               VARCHAR(500),
    modifiers_json      TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE order_notes (
    id          BIGSERIAL PRIMARY KEY,
    order_id    BIGINT NOT NULL REFERENCES pos_orders(id) ON DELETE CASCADE,
    item_id     BIGINT REFERENCES pos_order_items(id) ON DELETE CASCADE,
    note        VARCHAR(1000) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by  VARCHAR(100)
);

CREATE TABLE payments (
    id              BIGSERIAL PRIMARY KEY,
    order_id        BIGINT NOT NULL REFERENCES pos_orders(id),
    payment_method  VARCHAR(20) NOT NULL CHECK (payment_method IN ('CASH','CARD','MIXED','OTHER')),
    amount          NUMERIC(14,2) NOT NULL,
    cash_amount     NUMERIC(14,2),
    card_amount     NUMERIC(14,2),
    reference_no    VARCHAR(100),
    paid_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(100)
);

CREATE TABLE settings (
    id          BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description VARCHAR(500),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_by  VARCHAR(100)
);

CREATE TABLE revoked_tokens (
    id          BIGSERIAL PRIMARY KEY,
    token_hash  VARCHAR(128) UNIQUE NOT NULL,
    expires_at  TIMESTAMP NOT NULL,
    revoked_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_revoked_tokens_expires ON revoked_tokens(expires_at);
